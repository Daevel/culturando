const isbnCandidatePattern = /(?:ISBN(?:-1[03])?:?\s*)?(?:97[89][\s-]?)?\d[\d\s-]{7,}[\dXx]/g;

export function extractIsbnFromText(text: string) {
  return extractIsbnsFromText(text)[0];
}

export function extractIsbnsFromText(text: string) {
  const candidates = text.match(isbnCandidatePattern) ?? [];
  const normalizedCandidates = candidates
    .map((candidate) => candidate.replace(/^ISBN(?:-1[03])?:?/i, "").replace(/[\s-]/g, ""))
    .filter((candidate) => candidate.length === 10 || candidate.length === 13);

  return Array.from(new Set(normalizedCandidates)).filter(isValidIsbn);
}

function isValidIsbn(value: string) {
  return value.length === 13 ? isValidIsbn13(value) : isValidIsbn10(value);
}

function isValidIsbn13(value: string) {
  if (!/^97[89]\d{10}$/.test(value)) {
    return false;
  }

  const digits = value.split("").map(Number);
  const sum = digits.slice(0, 12).reduce((total, digit, index) => {
    return total + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === digits[12];
}

function isValidIsbn10(value: string) {
  if (!/^\d{9}[\dXx]$/.test(value)) {
    return false;
  }

  const sum = value.split("").reduce((total, character, index) => {
    const digit = character.toLowerCase() === "x" ? 10 : Number(character);

    return total + digit * (10 - index);
  }, 0);

  return sum % 11 === 0;
}
