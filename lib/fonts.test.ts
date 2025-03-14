import { describe, expect, it, vi } from "vitest";

import { fontMono, fontSans } from "./fonts";

// mock next/font/google since it's not available in test environment
vi.mock("next/font/google", () => ({
  Geist: vi.fn().mockImplementation(({ variable }) => ({
    variable,
    style: { fontFamily: "var(--font-geist-sans)" },
  })),
  Geist_Mono: vi.fn().mockImplementation(({ variable }) => ({
    variable,
    style: { fontFamily: "var(--font-geist-mono)" },
  })),
}));

describe("fonts", () => {
  it("should export fontSans with correct configuration", () => {
    // check that fontSans is defined
    expect(fontSans).toBeDefined();

    // check variable name
    expect(fontSans.variable).toBe("--font-geist-sans");

    // check style
    expect(fontSans.style).toEqual({ fontFamily: "var(--font-geist-sans)" });
  });

  it("should export fontMono with correct configuration", () => {
    // check that fontMono is defined
    expect(fontMono).toBeDefined();

    // check variable name
    expect(fontMono.variable).toBe("--font-geist-mono");

    // check style
    expect(fontMono.style).toEqual({ fontFamily: "var(--font-geist-mono)" });
  });
});
