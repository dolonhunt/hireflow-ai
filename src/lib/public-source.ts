import { createId, nowIso } from "@/lib/helpers";
import { extractContactsFromText } from "@/lib/contact-extractor";
import { Candidate, CandidateContact, CandidateSource } from "@/lib/types";

export async function ingestPublicProfileUrl(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Public profile fetch failed with ${response.status}`);
  }

  const html = await response.text();
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const metaDescriptionMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const now = nowIso();
  const text = `${titleMatch?.[1] ?? ""} ${metaDescriptionMatch?.[1] ?? ""} ${html.slice(0, 2000)}`;
  const contacts = extractContactsFromText(text);

  const candidate: Candidate = {
    id: createId("cand"),
    name: (titleMatch?.[1] || "Public Portfolio").replace(/\s*[|-].*$/, "").trim(),
    headline: metaDescriptionMatch?.[1] || "Imported from public profile URL",
    currentCompany: undefined,
    currentRole: undefined,
    location: "Bangladesh",
    roleFamily: "production",
    summary: metaDescriptionMatch?.[1] || "Imported from a public source URL.",
    yearsExperience: 1,
    expectedSalary: undefined,
    languages: ["Bangla", "English"],
    skills: [],
    portfolioUrls: [url],
    lastActiveAt: now,
    tags: ["public-web"],
    createdAt: now,
    updatedAt: now,
  };

  const contactRecords: CandidateContact[] = [
    ...contacts.emails.map((value, index) => ({
      id: createId("contact"),
      candidateId: candidate.id,
      type: "email" as const,
      value,
      provenance: "public_web" as const,
      isPrimary: index === 0,
      createdAt: now,
    })),
    ...contacts.phones.map((value, index) => ({
      id: createId("contact"),
      candidateId: candidate.id,
      type: "phone" as const,
      value,
      provenance: "public_web" as const,
      isPrimary: contacts.emails.length === 0 && index === 0,
      createdAt: now,
    })),
  ];

  const source: CandidateSource = {
    id: createId("source"),
    candidateId: candidate.id,
    sourceType: "public_portfolio",
    importMethod: "manual_public_url",
    url,
    confidence: 0.74,
    collectedAt: now,
  };

  return { candidate, contacts: contactRecords, source };
}
