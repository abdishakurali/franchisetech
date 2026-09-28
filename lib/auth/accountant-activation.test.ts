import { describe, expect, it } from "vitest";
import { parseAccountantActivation } from "./accountant-activation";

describe("accountant activation", () => {
  it("reads the session returned in the URL fragment", () => {
    expect(parseAccountantActivation("#access_token=access&refresh_token=refresh&type=recovery")).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
    });
  });

  it("rejects incomplete activation fragments", () => {
    expect(parseAccountantActivation("#access_token=access&type=recovery")).toBeNull();
  });
});
