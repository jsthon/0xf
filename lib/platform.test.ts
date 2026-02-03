import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// store original window object
const originalWindow = global.window;

describe("platform utilities", () => {
  // setup mock window object before each test
  beforeEach(() => {
    global.window = {
      navigator: {
        platform: "",
      },
    } as unknown as Window & typeof globalThis;
  });

  // restore original window object after each test
  afterEach(() => {
    global.window = originalWindow;
    vi.resetModules();
  });

  it("should detect Apple devices correctly", async () => {
    // test various device platforms
    const testCases = [
      { platform: "MacIntel", expected: true },
      { platform: "iPhone", expected: true },
      { platform: "iPad", expected: true },
      { platform: "iPod", expected: true },
      { platform: "Win32", expected: false },
      { platform: "Linux x86_64", expected: false },
      { platform: "Android", expected: false },
    ];

    for (const { platform, expected } of testCases) {
      // set platform value for current test case
      Object.defineProperty(global.window.navigator, "platform", {
        value: platform,
        configurable: true,
      });

      // import module to evaluate isAppleDevice with current platform
      const { isAppleDevice } = await import("./platform");

      // verify detection works correctly
      expect(isAppleDevice()).toBe(expected);

      // reset module cache for next test case
      vi.resetModules();
    }
  });
});
