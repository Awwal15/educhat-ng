const superscriptCharacters: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  "/": "⁄",
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ⁱ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",
  " ": " ",
};

const latexSymbols: Record<string, string> = {
  times: "×",
  cdot: "·",
  div: "÷",
  pm: "±",
  pi: "π",
  theta: "θ",
  alpha: "α",
  beta: "β",
  neq: "≠",
  leq: "≤",
  geq: "≥",
  approx: "≈",
  infty: "∞",
  sum: "∑",
  int: "∫",
};

const toSuperscript = (value: string) => {
  const expression = value.trim().replace(/^\((.*)\)$/s, "$1").trim();
  const superscript = Array.from(expression)
    .map((character) => superscriptCharacters[character] ?? character)
    .join("");

  return expression.length === 1 ? superscript : `⁽${superscript}⁾`;
};

export function formatMathResponse(content: string): string {
  return content
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "$1⁄$2")
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, "√($1)")
    .replace(/\\(times|cdot|div|pm|pi|theta|alpha|beta|neq|leq|geq|approx|infty|sum|int)\b/g, (_match, command: string) => latexSymbols[command])
    .replace(/\\(?:left|right)\b/g, "")
    .replace(/\\(?:mathrm|mathbf|text)\b\s*/g, "")
    .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
    .replace(/\$+/g, "")
    .replace(/\^\{([^{}]+)\}/g, (_match, exponent: string) => toSuperscript(exponent))
    .replace(/\^\(([^()]*)\)/g, (_match, exponent: string) => toSuperscript(exponent))
    .replace(/\^([A-Za-z0-9])/g, (_match, exponent: string) => toSuperscript(exponent))
    .replace(/[{}]/g, "");
}