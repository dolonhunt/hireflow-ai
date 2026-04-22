import crypto from "crypto";

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalisePhone(value: string) {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+880")) {
    return digits;
  }
  if (digits.startsWith("880")) {
    return `+${digits}`;
  }
  if (/^01\d{9}$/.test(digits)) {
    return `+88${digits}`;
  }
  return digits;
}

export function normaliseName(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function hashText(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .filter(Boolean);
}

export function daysSince(dateIso: string) {
  const ms = Date.now() - new Date(dateIso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
