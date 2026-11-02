// Phase 0, step 1: record FiscalNet's real HTTP reply on every API receipt,
// without changing whether a receipt counts as ok.
//
// Runs fiscalBrowserReceipt against a real local HTTP server that answers in
// the shapes documented at driverfiscal.ro/documentatie-api-fiscalnet
// (ReceiptStatus / ReceiptNumber / ErrorCode / ErrorInfo). The `ok` values
// asserted here CHARACTERISE CURRENT BEHAVIOUR, including the known gap that
// any HTTP 200 counts as ok. Phase 0 step 2 will change that deliberately and
// must update these expectations on purpose, not by accident.

import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fiscalBrowserReceipt, type BrowserFiscalConfig } from "./browser";

type Reply = { status: number; body: string };
let nextReply: Reply = { status: 200, body: "" };
const received: Array<{ method?: string; url?: string; body: string }> = [];
let server: Server;
let host = "";

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      received.push({ method: req.method, url: req.url, body });
      res.writeHead(nextReply.status, { "Content-Type": "application/json" });
      res.end(nextReply.body);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  host = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const config = (): BrowserFiscalConfig => ({
  enabled: true,
  mockMode: false,
  connectionMode: "api",
  apiHost: host,
  vatGroups: [],
  paymentTypeMap: { cash: 1, card: 2 },
});

const items = [{ productName: "Espresso", quantity: 1, unitPrice: 12, vatRate: 11, fiscalNetGroup: 2 }];

async function sell(reply: Reply) {
  nextReply = reply;
  return fiscalBrowserReceipt(config(), items, 12, "cash");
}

describe("FiscalNet API raw reply capture", () => {
  it("posts the receipt lines and records a documented success reply verbatim", async () => {
    const body = JSON.stringify({ ReceiptStatus: true, ReceiptNumber: "1234", ReceiptInfo: "OK" });
    const result = await sell({ status: 200, body });

    expect(result.ok).toBe(true);
    expect(result.message).toBe("Comandă trimisă.");
    expect(result.rawResponse).toBe(`HTTP 200 ${body}`);
    const last = received.at(-1)!;
    expect(last.method).toBe("POST");
    expect(last.url).toBe("/api/Receipt");
    expect(JSON.parse(last.body)).toEqual(["S^Espresso^1200^1000^Buc^2^1", "ST^0", "P^1^1200"]);
  });

  it("captures a documented device error even though it is still treated as ok today (known gap)", async () => {
    const body = JSON.stringify({ ReceiptStatus: false, ErrorCode: "-111015", ErrorInfo: "Hartie terminata" });
    const result = await sell({ status: 200, body });

    expect(result.ok).toBe(true); // the gap Phase 0 step 2 fixes
    expect(result.rawResponse).toContain('"ReceiptStatus":false');
    expect(result.rawResponse).toContain("Hartie terminata");
  });

  it("keeps HTTP errors failed and records the body", async () => {
    const result = await sell({ status: 500, body: "internal error" });
    expect(result.ok).toBe(false);
    expect(result.rawResponse).toBe("HTTP 500 internal error");
  });

  it("truncates very long replies", async () => {
    const result = await sell({ status: 200, body: "x".repeat(5000) });
    expect(result.rawResponse).toHaveLength(2000);
  });

  it("has no raw reply when FiscalNet is unreachable", async () => {
    const result = await fiscalBrowserReceipt({ ...config(), apiHost: "http://127.0.0.1:1" }, items, 12, "cash");
    expect(result.ok).toBe(false);
    expect(result.rawResponse).toBeUndefined();
  });

  it("never calls the device in mock mode", async () => {
    const before = received.length;
    const result = await fiscalBrowserReceipt({ ...config(), mockMode: true }, items, 12, "cash");
    expect(result.ok).toBe(true);
    expect(result.rawResponse).toBeUndefined();
    expect(received.length).toBe(before);
  });
});
