import { describe, expect, it } from "vitest";
import { findCandidateDuplicate } from "@/lib/dedupe";

describe("findCandidateDuplicate", () => {
  it("matches duplicates by email or source URL", () => {
    const candidates = [
      {
        id: "cand_1",
        name: "Farzana Rahman",
        headline: "",
        location: "Dhaka",
        roleFamily: "editorial",
        summary: "",
        yearsExperience: 1,
        languages: [],
        skills: [],
        portfolioUrls: [],
        lastActiveAt: new Date().toISOString(),
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ] as const;

    const duplicate = findCandidateDuplicate(
      [...candidates],
      [
        {
          id: "contact_1",
          candidateId: "cand_1",
          type: "email",
          value: "farzana@example.com",
          provenance: "manual",
          isPrimary: true,
          createdAt: new Date().toISOString(),
        },
      ],
      [
        {
          id: "source_1",
          candidateId: "cand_1",
          sourceType: "manual_social",
          importMethod: "linkedin",
          url: "https://linkedin.com/in/farzana",
          confidence: 0.8,
          collectedAt: new Date().toISOString(),
        },
      ],
      [],
      {
        name: "Farzana Rahman",
        contacts: [{ type: "email", value: "farzana@example.com" }],
        sourceUrl: "https://linkedin.com/in/farzana",
      },
    );

    expect(duplicate?.id).toBe("cand_1");
  });
});
