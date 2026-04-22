import { describe, expect, it } from "vitest";
import { scoreCandidateForJob } from "@/lib/scoring";

describe("scoreCandidateForJob", () => {
  it("returns a higher score for closer skill and title overlap", () => {
    const job = {
      id: "job_1",
      title: "Video Editor",
      department: "Multimedia",
      roleFamily: "multimedia",
      location: "Dhaka",
      salaryMin: 30000,
      salaryMax: 60000,
      requiredSkills: ["Premiere Pro", "After Effects"],
      requiredLanguages: ["Bangla", "English"],
      experienceMinYears: 2,
      summary: "",
      requiresPortfolio: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as const;

    const candidate = {
      id: "cand_1",
      name: "Mashrur",
      headline: "Video editor and motion storyteller",
      location: "Dhaka",
      roleFamily: "multimedia",
      summary: "Premiere Pro and After Effects editor",
      yearsExperience: 4,
      expectedSalary: 45000,
      languages: ["Bangla", "English"],
      skills: ["Premiere Pro", "After Effects"],
      portfolioUrls: ["https://example.com"],
      lastActiveAt: new Date().toISOString(),
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as const;

    const result = scoreCandidateForJob(candidate, job);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.recommendedNextAction).toBe("Shortlist and outreach");
  });
});
