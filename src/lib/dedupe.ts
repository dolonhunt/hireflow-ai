import { normaliseName, normalisePhone } from "@/lib/helpers";
import { Candidate, CandidateContact, CandidateDocument, CandidateSource } from "@/lib/types";

interface CandidateLookupInput {
  name: string;
  contacts?: Array<Pick<CandidateContact, "type" | "value">>;
  sourceUrl?: string;
  documentHash?: string;
}

export function findCandidateDuplicate(
  candidates: Candidate[],
  contacts: CandidateContact[],
  sources: CandidateSource[],
  documents: CandidateDocument[],
  input: CandidateLookupInput,
) {
  const emailValues = (input.contacts ?? [])
    .filter((contact) => contact.type === "email")
    .map((contact) => contact.value.toLowerCase());
  const phoneValues = (input.contacts ?? [])
    .filter((contact) => contact.type === "phone")
    .map((contact) => normalisePhone(contact.value));
  const normalisedName = normaliseName(input.name);

  for (const candidate of candidates) {
    const candidateContacts = contacts.filter((contact) => contact.candidateId === candidate.id);
    const candidateSources = sources.filter((source) => source.candidateId === candidate.id);
    const candidateDocuments = documents.filter((document) => document.candidateId === candidate.id);

    if (
      candidateContacts.some((contact) => emailValues.includes(contact.value.toLowerCase())) ||
      candidateContacts.some((contact) => phoneValues.includes(normalisePhone(contact.value))) ||
      candidateSources.some((source) => source.url && source.url === input.sourceUrl) ||
      candidateDocuments.some((document) => document.hash === input.documentHash)
    ) {
      return candidate;
    }

    if (normaliseName(candidate.name) === normalisedName && input.sourceUrl) {
      return candidate;
    }
  }

  return null;
}
