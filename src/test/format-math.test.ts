import { describe, expect, it } from "vitest";
import { formatMathResponse } from "@/lib/format-math";

describe("formatMathResponse", () => {
  it("removes math delimiters and displays fractional exponents as superscripts", () => {
    const answer = "$y^{1/2} \\times y^1 = y^{(1/2 + 1)} = y^{3/2}$";

    expect(formatMathResponse(answer)).toBe("y⁽¹⁄²⁾ × y¹ = y⁽¹⁄² ⁺ ¹⁾ = y⁽³⁄²⁾");
  });

  it("displays ordinary powers without dollar signs or caret notation", () => {
    expect(formatMathResponse("$x^2 + 2x + 1$")).toBe("x² + 2x + 1");
  });
});