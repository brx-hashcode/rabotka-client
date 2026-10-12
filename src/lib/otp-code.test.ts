// @vitest-environment node
import { describe, expect, it } from "vitest";
import { extractOtpCode } from "./otp-code";

describe("extractOtpCode", () => {
  it.each([
    ["123456", "123456"],
    [" 123456 ", "123456"],
    ["123 456", "123456"],
    ["123-456", "123456"],
    ["Votre code Rabotka est 123456. Valable 5 min", "123456"],
    ["*123456* est votre code de vérification.", "123456"],
    ["Code: 042317", "042317"],
  ])("finds the code in %p", (text, code) => {
    expect(extractOtpCode(text)).toBe(code);
  });

  it.each([
    ["12345"],
    ["1234567"],
    ["no code here"],
    [""],
    ["12 34 56 78"],
  ])("finds nothing in %p", (text) => {
    expect(extractOtpCode(text)).toBeNull();
  });

  it("never glues a code to the digits of the next sentence", () => {
    expect(extractOtpCode("123456. Valable 5 min")).toBe("123456");
  });

  it("handles nothing at all", () => {
    expect(extractOtpCode(null)).toBeNull();
    expect(extractOtpCode(undefined)).toBeNull();
  });
});
