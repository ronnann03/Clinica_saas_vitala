const ACCENTS: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ü: "u",
  ñ: "n",
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((char) => ACCENTS[char] ?? char)
    .join("")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
