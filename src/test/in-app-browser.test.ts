// @vitest-environment node
// Pure UA-string matching, no DOM needed — and the shared jsdom environment
// currently fails to load (canvas native bindings are not built locally).
import { describe, expect, it } from "vitest";
import { isInAppBrowser } from "@/lib/in-app-browser";

const WHATSAPP_ANDROID =
  "Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 WhatsApp/2.23.24.14 A";
const FACEBOOK_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21B74 [FBAN/FBIOS;FBAV/442.0.0.30.107]";
const INSTAGRAM_ANDROID =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 Instagram 310.0.0.37.328";
const CHROME_ANDROID =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const SAFARI_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";

describe("isInAppBrowser", () => {
  it.each([
    ["WhatsApp on Android", WHATSAPP_ANDROID],
    ["Facebook on iOS", FACEBOOK_IOS],
    ["Instagram on Android", INSTAGRAM_ANDROID],
  ])("detects %s", (_label, userAgent) => {
    expect(isInAppBrowser(userAgent)).toBe(true);
  });

  it.each([
    ["Chrome on Android", CHROME_ANDROID],
    ["Safari on iOS", SAFARI_IOS],
  ])("does not flag %s", (_label, userAgent) => {
    expect(isInAppBrowser(userAgent)).toBe(false);
  });

  it("does not flag an empty user agent", () => {
    expect(isInAppBrowser("")).toBe(false);
  });
});
