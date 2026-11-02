// Phase 0: record FiscalNet's real HTTP reply on every API receipt (step 1)
// and read the documented confirmation from it (step 2).
//
// Runs fiscalBrowserReceipt against a real local HTTP server that answers in
// the shapes documented at driverfiscal.ro/documentatie-api-fiscalnet
// (ReceiptStatus / ReceiptNumber / ErrorCode / ErrorInfo). Before step 2 any
// HTTP 200 counted as ok; now only ReceiptStatus decides, and a 200 that says
// nothing is "unconfirmed" (ok stays true, never logged as success).

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
    expect(result.confirmation).toBe("confirmed");
    expect(result.receiptNumber).toBe("1234");
    expect(result.message).toBe("Bon fiscal emis. Nr: 1234");
    expect(result.rawResponse).toBe(`HTTP 200 ${body}`);
    const last = received.at(-1)!;
    expect(last.method).toBe("POST");
    expect(last.url).toBe("/api/Receipt");
    expect(JSON.parse(last.body)).toEqual(["S^Espresso^1200^1000^Buc^2^1", "ST^0", "P^1^1200"]);
  });

  it("treats a documented device error as a failure, with the device's code", async () => {
    const body = JSON.stringify({ ReceiptStatus: false, ErrorCode: "-111015", ErrorInfo: "Hartie terminata" });
    const result = await sell({ status: 200, body });

    expect(result.ok).toBe(false);
    expect(result.confirmation).toBe("device_error");
    expect(result.errorCode).toBe("-111015");
    expect(result.message).toBe("Eroare casă: -111015 — Hartie terminata");
    expect(result.rawResponse).toContain("Hartie terminata");
  });

  it("matches ReceiptStatus case-insensitively and accepts string forms", async () => {
    const lower = await sell({ status: 200, body: JSON.stringify({ receiptStatus: "true", receiptNumber: 42 }) });
    expect(lower).toMatchObject({ ok: true, confirmation: "confirmed", receiptNumber: "42" });
    const nu = await sell({ status: 200, body: JSON.stringify({ RECEIPTSTATUS: "NU", ERRORINFO: "Sertar" }) });
    expect(nu).toMatchObject({ ok: false, confirmation: "device_error", message: "Eroare casă: Sertar" });
  });

  it("trusts the device's ReceiptStatus over the HTTP status", async () => {
    const result = await sell({ status: 500, body: JSON.stringify({ ReceiptStatus: false, ErrorCode: "E1" }) });
    expect(result).toMatchObject({ ok: false, confirmation: "device_error", errorCode: "E1" });
  });

  it("marks a 200 that confirms nothing as unconfirmed — ok for the POS flow, never a confirmed receipt", async () => {
    for (const body of ["", "OK", "<html></html>", "[1,2]", "null", JSON.stringify({ ReceiptStatus: "maybe" })]) {
      const result = await sell({ status: 200, body });
      expect(result, body).toMatchObject({ ok: true, confirmation: "unconfirmed", message: "Comandă trimisă." });
      expect(result.receiptNumber, body).toBeUndefined();
    }
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
