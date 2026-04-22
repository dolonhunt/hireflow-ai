import { describe, expect, it } from "vitest";
import { extractContactsFromText } from "@/lib/contact-extractor";

describe("extractContactsFromText", () => {
  it("extracts Bangladeshi phone numbers, emails, and URLs", () => {
    const result = extractContactsFromText(
      "Email hello@example.com or call 01712345678. Portfolio: https://example.com/folio",
    );

    expect(result.emails).toEqual(["hello@example.com"]);
    expect(result.phones).toEqual(["+8801712345678"]);
    expect(result.urls).toEqual(["https://example.com/folio"]);
  });
});
