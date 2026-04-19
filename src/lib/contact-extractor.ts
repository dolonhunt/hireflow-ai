import { normalisePhone } from "@/lib/helpers";

const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phoneRegex = /(?:\+?880|0)1[3-9]\d{8}\b/g;
const urlRegex = /\bhttps?:\/\/[^\s<>"']+/gi;

export function extractEmails(text: string) {
  return Array.from(new Set(text.match(emailRegex) ?? [])).map((value) => value.toLowerCase());
}

export function extractPhones(text: string) {
  return Array.from(new Set((text.match(phoneRegex) ?? []).map(normalisePhone)));
}

export function extractUrls(text: string) {
  return Array.from(new Set(text.match(urlRegex) ?? []));
}

export function extractContactsFromText(text: string) {
  return {
    emails: extractEmails(text),
    phones: extractPhones(text),
    urls: extractUrls(text),
  };
}
