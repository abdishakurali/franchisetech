import { describe, expect, it } from "vitest";
import { mapSupabaseAuthError } from "./auth-error-messages";

describe("mapSupabaseAuthError", () => {
  it("translates the login errors users actually see", () => {
    expect(mapSupabaseAuthError("Invalid login credentials", "ro")).toBe("Email sau parolă incorectă.");
    expect(mapSupabaseAuthError("Email not confirmed", "ro")).toContain("nu a fost confirmat");
    expect(mapSupabaseAuthError("network_error", "ro")).toContain("conexiunea la internet");
  });

  it("translates the resend cooldown with its number of seconds", () => {
    const msg = mapSupabaseAuthError("For security purposes, you can only request this after 42 seconds.", "ro");
    expect(msg).toContain("42 secunde");
    expect(msg).not.toMatch(/security purposes/i);
  });

  it("translates the same-password error on reset", () => {
    expect(mapSupabaseAuthError("New password should be different from the old password.", "ro")).toBe(
      "Parola nouă trebuie să fie diferită de cea veche.",
    );
  });

  it("falls back to the raw message for unknown errors", () => {
    expect(mapSupabaseAuthError("Something odd", "ro")).toBe("Something odd");
  });
});
