import { createId, nowIso } from "@/lib/helpers";
import { Candidate, CandidateContact, CandidateSource } from "@/lib/types";

function getGitHubHeaders(): Record<string, string> {
  return {
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
  };
}

function inferRoleFamily(bio: string) {
  const lowerBio = bio.toLowerCase();
  if (lowerBio.includes("design")) return "design";
  if (lowerBio.includes("video") || lowerBio.includes("editor")) return "multimedia";
  if (lowerBio.includes("hr")) return "hr";
  if (lowerBio.includes("finance")) return "finance";
  if (lowerBio.includes("ops")) return "operations";
  return "it";
}

export async function fetchGitHubProfile(profileInput: string) {
  const username = profileInput
    .replace("https://github.com/", "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim();

  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: getGitHubHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub profile fetch failed with ${response.status}`);
  }

  const profile = await response.json();
  const now = nowIso();

  const candidate: Candidate = {
    id: createId("cand"),
    name: profile.name || username,
    headline: profile.bio || "GitHub public profile",
    currentCompany: profile.company || undefined,
    currentRole: profile.bio || undefined,
    location: profile.location || "Bangladesh",
    roleFamily: inferRoleFamily(profile.bio || ""),
    summary: profile.bio || "Imported from GitHub public profile.",
    yearsExperience: 2,
    expectedSalary: undefined,
    languages: ["English"],
    skills: [],
    portfolioUrls: [profile.html_url].filter(Boolean),
    lastActiveAt: now,
    tags: ["github"],
    createdAt: now,
    updatedAt: now,
  };

  const contacts: CandidateContact[] = profile.email
    ? [
        {
          id: createId("contact"),
          candidateId: candidate.id,
          type: "email",
          value: profile.email,
          provenance: "github",
          isPrimary: true,
          createdAt: now,
        },
      ]
    : [];

  const source: CandidateSource = {
    id: createId("source"),
    candidateId: candidate.id,
    sourceType: "github_public",
    importMethod: "manual_public_profile",
    url: profile.html_url,
    confidence: 0.86,
    collectedAt: now,
  };

  return { candidate, contacts, source };
}

export async function searchGitHubUsers(query: string) {
  const response = await fetch(
    `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=5`,
    { headers: getGitHubHeaders(), cache: "no-store" },
  );

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return (result.items ?? []) as Array<{ login: string; html_url: string }>;
}
