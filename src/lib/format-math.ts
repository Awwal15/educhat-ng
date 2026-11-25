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

const fractionStart = "\uE000";
const fractionEnd = "\uE001";

const toSuperscript = (value: string) => {
  const expression = value.trim().replace(/^\((.*)\)$/s, "$1").trim();
  const parts = expression.split(/(\d+\s*\/\s*\d+)/g);
  const superscript = parts
    .map((part) => {
      if (/^\d+\s*\/\s*\d+$/.test(part)) {
        const [numerator, denominator] = part.split("/").map((number) => number.trim());
        return `${fractionStart}${numerator}/${denominator}${fractionEnd}`;
      }

      return Array.from(part)
        .map((character) => superscriptCharacters[character] ?? character)
        .join("");
    })
    .join("");

  return expression.length === 1 ? superscript : `⁽${superscript}⁾`;
};

export type MathTextSegment =
  | { type: "text"; text: string }
  | { type: "fraction"; numerator: string; denominator: string };

export function splitMathText(content: string): MathTextSegment[] {
  const segments: MathTextSegment[] = [];
  const fractionPattern = /\uE000(\d+)\/(\d+)\uE001/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fractionPattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", text: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: "fraction", numerator: match[1], denominator: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length || segments.length === 0) {
    segments.push({ type: "text", text: content.slice(lastIndex) });
  }

  return segments;
}

export function formatMathResponse(content: string): string {
  return content
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "$1/$2")
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