import { describe, expect, it, vi } from "vitest";
import { AnafRefusal, addWorkingDays, runPlatformUpload, type WorkerDeps, type WorkerInvoice, type WorkerStore } from "./platform-worker";

function memory(initial: WorkerInvoice[]) {
  const rows = new Map(initial.map((r) => [r.id, { ...r }]));
  const tick = () => new Promise<void>((r) => setTimeout(r, Math.random() * 3));
  const store: WorkerStore & { rows: typeof rows } = {
    rows,
    async listOpen() { await tick(); return [...rows.values()].map((r) => ({ ...r })); },
    async claim(id) { await tick(); const r = rows.get(id)!; if (r.uploadStatus !== "ready") return false; r.uploadStatus = "uploading"; return true; },
    async markUploaded(id) { await tick(); rows.get(id)!.uploadStatus = "uploaded"; },
    async markBack(id, status, message) { await tick(); const r = rows.get(id)!; r.uploadStatus = status; r.errorMessage = message; },
    async statusOf(id) { return rows.get(id)?.uploadStatus ?? null; },
  };
  return store;
}

const inv = (id: string, over: Partial<WorkerInvoice> = {}): WorkerInvoice => ({
  id, invoiceNumber: `SLT${id}`, issueDate: "2026-11-03", uploadStatus: "ready", xml: "<Invoice/>",
  stornoOf: null, updatedAt: "2026-11-03T10:00:00Z", errorMessage: null, ...over,
});

function deps(store: WorkerStore, over: Partial<WorkerDeps> = {}) {
  const upload = vi.fn().mockImplementation(async () => { await new Promise((r) => setTimeout(r, 2)); return { indexIncarcare: 123, executionStatus: 0 }; });
  const validate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
  const d: WorkerDeps = {
    store, cif: "49702253", uploadEnabled: true,
    anaf: { upload, validate },
    accessToken: async () => "token",
    now: () => new Date("2026-11-04T09:00:00Z"),
    ...over,
  };
  return { d, upload, validate };
}

describe("working-day deadline", () => {
  it("counts Mon–Fri only", () => {
    expect(addWorkingDays("2026-11-06", 1).toISOString().slice(0, 10)).toBe("2026-11-09"); // Fri → Mon
    expect(addWorkingDays("2026-11-03", 5).toISOString().slice(0, 10)).toBe("2026-11-10"); // Tue → next Tue
  });
});

describe("upload safety", () => {
  it("uploads a valid ready invoice once", async () => {
    const store = memory([inv("1")]);
    const { d, upload } = deps(store);
    const r = await runPlatformUpload(d);
    expect(r.uploaded).toEqual(["SLT1"]);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(store.rows.get("1")!.uploadStatus).toBe("uploaded");
  });

  it("two runs at the same time never upload the same invoice twice", async () => {
    const store = memory(Array.from({ length: 10 }, (_, i) => inv(String(i))));
    const { d, upload } = deps(store);
    await Promise.all([runPlatformUpload(d), runPlatformUpload(d), runPlatformUpload(d)]);
    expect(upload).toHaveBeenCalledTimes(10);
    expect([...store.rows.values()].every((r) => r.uploadStatus === "uploaded")).toBe(true);
  });

  it("a timeout parks the invoice for a human and never re-sends it", async () => {
    const store = memory([inv("1")]);
    const { d, upload } = deps(store, { anaf: { validate: async () => ({ valid: true, errors: [] }), upload: vi.fn().mockRejectedValue(new Error("fetch failed")) } });
    const r = await runPlatformUpload(d);
    expect(r.parked).toEqual(["SLT1"]);
    expect(store.rows.get("1")!.uploadStatus).toBe("upload_unknown");
    await runPlatformUpload(d);
    expect(d.anaf.upload).toHaveBeenCalledTimes(1);
    void upload;
  });

  it("an explicit ANAF refusal puts it back in the queue for the next run", async () => {
    const store = memory([inv("1")]);
    const { d } = deps(store, { anaf: { validate: async () => ({ valid: true, errors: [] }), upload: vi.fn().mockRejectedValue(new AnafRefusal("Bad request", 400)) } });
    const r = await runPlatformUpload(d);
    expect(store.rows.get("1")!.uploadStatus).toBe("ready");
    expect(r.alerts.join(" ")).toMatch(/HTTP 400/);
  });

  it("an invoice left 'uploading' by a crashed run is parked, not re-sent", async () => {
    const store = memory([inv("1", { uploadStatus: "uploading", updatedAt: "2026-11-03T08:00:00Z" })]);
    const { d, upload } = deps(store);
    const r = await runPlatformUpload(d);
    expect(store.rows.get("1")!.uploadStatus).toBe("upload_unknown");
    expect(r.parked).toEqual(["SLT1"]);
    expect(upload).not.toHaveBeenCalled();
  });

  it("an invoice that fails ANAF validation is never uploaded", async () => {
    const store = memory([inv("1")]);
    const { d, upload } = deps(store, { anaf: { validate: async () => ({ valid: false, errors: ["BR-RO-101: oras"] }), upload: vi.fn() } });
    const r = await runPlatformUpload(d);
    expect(store.rows.get("1")!.uploadStatus).toBe("invalid");
    expect(r.invalid[0].errors).toEqual(["BR-RO-101: oras"]);
    expect(d.anaf.upload).not.toHaveBeenCalled();
    void upload;
  });

  it("keeps the invoice queued when the validator itself is down", async () => {
    const store = memory([inv("1")]);
    const { d } = deps(store, { anaf: { validate: vi.fn().mockRejectedValue(new Error("503")), upload: vi.fn() } });
    await runPlatformUpload(d);
    expect(store.rows.get("1")!.uploadStatus).toBe("ready");
  });

  it("waits to send a storno until its original is accepted", async () => {
    const store = memory([inv("1", { uploadStatus: "uploaded" }), inv("2", { stornoOf: "1" })]);
    const { d, upload } = deps(store);
    const first = await runPlatformUpload(d);
    expect(first.waitingForOriginal).toEqual(["SLT2"]);
    expect(upload).not.toHaveBeenCalled();
    store.rows.get("1")!.uploadStatus = "accepted";
    const second = await runPlatformUpload(d);
    expect(second.uploaded).toEqual(["SLT2"]);
  });

  it("without an ANAF authorisation nothing is sent and the founder is told", async () => {
    const store = memory([inv("1")]);
    const { d, upload } = deps(store, { accessToken: async () => { throw new Error("not configured"); } });
    const r = await runPlatformUpload(d);
    expect(upload).not.toHaveBeenCalled();
    expect(store.rows.get("1")!.uploadStatus).toBe("ready");
    expect(r.alerts[0]).toMatch(/autorizarea ANAF/);
  });

  it("shadow mode validates and reports but uploads nothing", async () => {
    const store = memory([inv("1")]);
    const { d, upload, validate } = deps(store, { uploadEnabled: false });
    const r = await runPlatformUpload(d);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(upload).not.toHaveBeenCalled();
    expect(r.shadowValidated).toEqual(["SLT1"]);
    expect(store.rows.get("1")!.uploadStatus).toBe("ready");
  });

  it("warns from 3 working days after issue, before the 5-day legal deadline", async () => {
    const store = memory([inv("1", { uploadStatus: "uploaded", issueDate: "2026-11-02" })]);
    const { d } = deps(store, { now: () => new Date("2026-11-05T12:00:00Z") });
    const r = await runPlatformUpload(d);
    expect(r.alerts.join(" ")).toMatch(/termenul legal este 2026-11-09/);
  });
});
