import { describe, expect, it } from "vitest";
import { formatMathResponse, splitMathText } from "@/lib/format-math";

describe("formatMathResponse", () => {
  it("removes math delimiters and displays fractional exponents as superscripts", () => {
    const answer = "$y^{1/2} \\times y^1 = y^{(1/2 + 1)} = y^{3/2}$";
    const formatted = formatMathResponse(answer);

    expect(formatted).not.toContain("$");
    expect(formatted).not.toContain("^");
    expect(splitMathText(formatted).filter((segment) => segment.type === "fraction")).toEqual([
      { type: "fraction", numerator: "1", denominator: "2" },
      { type: "fraction", numerator: "1", denominator: "2" },
      { type: "fraction", numerator: "3", denominator: "2" },
    ]);
  });

  it("displays ordinary powers without dollar signs or caret notation", () => {
    expect(formatMathResponse("$x^2 + 2x + 1$")).toBe("x² + 2x + 1");
  });
});