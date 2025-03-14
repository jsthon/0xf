import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn function", () => {
  it("should merge class names correctly", () => {
    // basic merging
    expect(cn("class1", "class2")).toBe("class1 class2");

    // conditional class names
    expect(cn("class1", true && "class2", false && "class3")).toBe(
      "class1 class2"
    );

    // object syntax
    expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");

    // array syntax
    expect(cn("class1", ["class2", "class3"])).toBe("class1 class2 class3");

    // tailwind merging
    expect(cn("px-2 py-1", "px-3")).toBe("py-1 px-3");
    expect(cn("flex items-center", "grid")).toBe("items-center grid");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn("", "")).toBe("");
    expect(cn(null, undefined, "")).toBe("");
  });

  it("should handle complex scenarios", () => {
    const condition = true;
    const dynamicClass = "dynamic";

    expect(
      cn(
        "static-class",
        condition && "conditional-class",
        condition ? dynamicClass : "alternative",
        { "object-class": true, "disabled-class": false }
      )
    ).toBe("static-class conditional-class dynamic object-class");
  });
});
