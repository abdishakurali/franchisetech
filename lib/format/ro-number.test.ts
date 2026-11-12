import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(), getAuthUser: vi.fn() }));

import { parseLocaleNumber } from "./ro-number";
import { numberValue } from "@/lib/kitchenops/data";

describe("parseLocaleNumber", () => {
  it("keeps dot decimals working", () => {
    expect(parseLocaleNumber("14.50")).toBe(14.5);
    expect(parseLocaleNumber("3")).toBe(3);
    expect(parseLocaleNumber(" 0.65 ")).toBe(0.65);
  });

  it("accepts the Romanian decimal comma", () => {
    expect(parseLocaleNumber("14,50")).toBe(14.5);
    expect(parseLocaleNumber("0,5")).toBe(0.5);
    expect(parseLocaleNumber("-2,25")).toBe(-2.25);
  });

  it("treats dots as thousands when a comma is present", () => {
    expect(parseLocaleNumber("1.234,50")).toBe(1234.5);
    expect(parseLocaleNumber("12.345.678,9")).toBe(12345678.9);
  });

  it("returns null for anything else", () => {
    expect(parseLocaleNumber("")).toBeNull();
    expect(parseLocaleNumber(null)).toBeNull();
    expect(parseLocaleNumber(undefined)).toBeNull();
    expect(parseLocaleNumber("abc")).toBeNull();
    expect(parseLocaleNumber("14,50,1")).toBeNull();
    expect(parseLocaleNumber("1,234.50")).toBeNull();
    expect(parseLocaleNumber("12.34,5")).toBeNull();
    expect(parseLocaleNumber("14,")).toBeNull();
    expect(parseLocaleNumber("lei 14")).toBeNull();
  });
});

describe("numberValue", () => {
  function fd(value: string) {
    const f = new FormData();
    f.set("sale_price", value);
    return f;
  }

  it("parses comma and dot prices", () => {
    expect(numberValue(fd("14,50"), "sale_price")).toBe(14.5);
    expect(numberValue(fd("1.234,50"), "sale_price")).toBe(1234.5);
    expect(numberValue(fd("14.50"), "sale_price")).toBe(14.5);
  });

  it("falls back on empty or invalid input", () => {
    expect(numberValue(fd(""), "sale_price", 7)).toBe(7);
    expect(numberValue(fd("abc"), "sale_price")).toBe(0);
    expect(numberValue(new FormData(), "sale_price", 3)).toBe(3);
  });
});
