import { daysSince, tokenize } from "@/lib/helpers";
import { Candidate, Job, ScoreBreakdown } from "@/lib/types";

function scoreRatio(matches: number, total: number) {
  if (total <= 0) return 60;
  return Math.round((matches / total) * 100);
}

export function scoreCandidateForJob(candidate: Candidate, job: Job) {
  const candidateTokens = tokenize(
    [candidate.headline, candidate.summary, candidate.currentRole, candidate.currentCompany]
      .filter(Boolean)
      .join(" "),
  );
  const titleTokens = tokenize(job.title);
  const matchedTitleTokens = titleTokens.filter((token) => candidateTokens.includes(token)).length;

  const jobSkills = job.requiredSkills.map((skill) => skill.toLowerCase());
  const candidateSkills = candidate.skills.map((skill) => skill.toLowerCase());
  const matchedSkills = jobSkills.filter((skill) =>
    candidateSkills.some((candidateSkill) => candidateSkill.includes(skill) || skill.includes(candidateSkill)),
  ).length;

  const titleFit = Math.min(
    100,
    scoreRatio(matchedTitleTokens, Math.max(titleTokens.length, 2)) + (candidate.roleFamily === job.roleFamily ? 20 : 0),
  );
  const skillOverlap = scoreRatio(matchedSkills, Math.max(jobSkills.length, 1));
  const experienceDepth = Math.min(100, Math.round((candidate.yearsExperience / Math.max(job.experienceMinYears, 1)) * 100));
  const locationFit =
    candidate.location.toLowerCase().includes(job.location.toLowerCase()) || candidate.location.toLowerCase().includes("remote")
      ? 100
      : 55;
  const salaryFit =
    !job.salaryMin || !candidate.expectedSalary
      ? 70
      : candidate.expectedSalary >= job.salaryMin && candidate.expectedSalary <= (job.salaryMax ?? candidate.expectedSalary)
        ? 100
        : candidate.expectedSalary < job.salaryMin
          ? 80
          : 45;
  const languageMatches = job.requiredLanguages.filter((language) =>
    candidate.languages.some((candidateLanguage) => candidateLanguage.toLowerCase() === language.toLowerCase()),
  ).length;
  const languageFit = scoreRatio(languageMatches, Math.max(job.requiredLanguages.length, 1));
  const portfolioRelevance = job.requiresPortfolio ? (candidate.portfolioUrls.length ? 100 : 30) : 80;
  const recency = Math.max(20, 100 - daysSince(candidate.lastActiveAt));

  const weightedScore = Math.round(
    titleFit * 0.18 +
      skillOverlap * 0.22 +
      experienceDepth * 0.15 +
      locationFit * 0.08 +
      salaryFit * 0.08 +
      languageFit * 0.1 +
      portfolioRelevance * 0.1 +
      recency * 0.09,
  );

  const notes = [
    matchedSkills ? `${matchedSkills} core skills aligned` : "Needs closer skill review",
    candidate.portfolioUrls.length ? "Portfolio link available" : "No portfolio link captured yet",
    candidate.expectedSalary ? `Salary expectation: BDT ${candidate.expectedSalary.toLocaleString()}` : "Salary expectation missing",
  ];

  const breakdown: ScoreBreakdown = {
    titleFit,
    skillOverlap,
    experienceDepth,
    locationFit,
    salaryFit,
    languageFit,
    portfolioRelevance,
    recency,
    notes,
  };

  let recommendedNextAction = "Keep in talent pool";
  if (weightedScore >= 85) recommendedNextAction = "Shortlist and outreach";
  else if (weightedScore >= 72) recommendedNextAction = "Review manually";
  else if (weightedScore >= 60) recommendedNextAction = "Screening call if the role is urgent";

  return {
    score: weightedScore,
    breakdown,
    recommendedNextAction,
  };
}
