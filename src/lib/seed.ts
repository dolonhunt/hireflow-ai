import { subDays, subHours } from "date-fns";
import { DEFAULT_OUTREACH_TEMPLATES, ROLE_TEMPLATES, WORKSPACE_LABEL } from "@/lib/constants";
import { createId, nowIso } from "@/lib/helpers";
import { scoreCandidateForJob } from "@/lib/scoring";
import { AppStore, Candidate, CandidateJobMatch, Job, PipelineStage } from "@/lib/types";

function isoRelative(hoursAgo = 0, daysAgo = 0) {
  let date = new Date();
  if (hoursAgo) date = subHours(date, hoursAgo);
  if (daysAgo) date = subDays(date, daysAgo);
  return date.toISOString();
}

function seedJobs() {
  const now = nowIso();
  return ROLE_TEMPLATES.slice(0, 4).map((job) => ({
    ...job,
    id: createId("job"),
    createdAt: now,
    updatedAt: now,
  })) satisfies Job[];
}

function seedCandidates(): Candidate[] {
  return [
    {
      id: createId("cand"),
      name: "Farzana Rahman",
      headline: "Senior Reporter covering politics and current affairs",
      currentCompany: "Dhaka Bulletin",
      currentRole: "Senior Reporter",
      location: "Dhaka",
      roleFamily: "editorial",
      summary: "Reporter with field and desk experience across longform and live updates.",
      yearsExperience: 5,
      expectedSalary: 62000,
      languages: ["Bangla", "English"],
      skills: ["Reporting", "News Writing", "Research", "Interviewing", "Live Desk"],
      portfolioUrls: ["https://portfolio.example.com/farzana-rahman"],
      lastActiveAt: isoRelative(4),
      tags: ["media", "editorial"],
      createdAt: isoRelative(6),
      updatedAt: isoRelative(4),
    },
    {
      id: createId("cand"),
      name: "Mashrur Hossain",
      headline: "Video editor and motion storyteller",
      currentCompany: "Studio 71",
      currentRole: "Video Editor",
      location: "Dhaka",
      roleFamily: "multimedia",
      summary: "Edits fast-turn video packages for news and digital campaigns.",
      yearsExperience: 4,
      expectedSalary: 50000,
      languages: ["Bangla", "English"],
      skills: ["Premiere Pro", "After Effects", "Storytelling", "Color Correction"],
      portfolioUrls: ["https://mashrur.video"],
      lastActiveAt: isoRelative(8),
      tags: ["portfolio", "multimedia"],
      createdAt: isoRelative(11),
      updatedAt: isoRelative(8),
    },
    {
      id: createId("cand"),
      name: "Sadia Karim",
      headline: "Finance executive with media and agency accounting experience",
      currentCompany: "Signal Media",
      currentRole: "Finance Executive",
      location: "Dhaka",
      roleFamily: "finance",
      summary: "Handles reconciliations, monthly reporting, and budget coordination.",
      yearsExperience: 3,
      expectedSalary: 45000,
      languages: ["Bangla", "English"],
      skills: ["Excel", "Budgeting", "Tally", "Financial Reporting", "Audit Support"],
      portfolioUrls: [],
      lastActiveAt: isoRelative(12),
      tags: ["finance"],
      createdAt: isoRelative(15),
      updatedAt: isoRelative(12),
    },
    {
      id: createId("cand"),
      name: "Rafiul Alam",
      headline: "IT support engineer for fast-paced newsroom environments",
      currentCompany: "NetPoint",
      currentRole: "IT Support Engineer",
      location: "Dhaka",
      roleFamily: "it",
      summary: "Supports devices, networking, workspace admin, and helpdesk workflows.",
      yearsExperience: 4,
      expectedSalary: 58000,
      languages: ["English"],
      skills: ["Networking", "Windows Administration", "Google Workspace", "Help Desk"],
      portfolioUrls: ["https://github.com/rafiulalam"],
      lastActiveAt: isoRelative(2),
      tags: ["it", "github"],
      createdAt: isoRelative(3),
      updatedAt: isoRelative(2),
    },
    {
      id: createId("cand"),
      name: "Tania Sultana",
      headline: "Graphic designer focused on social and newsroom visuals",
      currentCompany: "Canvas Creative",
      currentRole: "Graphic Designer",
      location: "Chattogram",
      roleFamily: "design",
      summary: "Designs campaign kits, thumbnails, and rapid-turn editorial graphics.",
      yearsExperience: 3,
      expectedSalary: 42000,
      languages: ["Bangla", "English"],
      skills: ["Figma", "Photoshop", "Illustrator", "Branding"],
      portfolioUrls: ["https://behance.net/taniasultana"],
      lastActiveAt: isoRelative(18),
      tags: ["design"],
      createdAt: isoRelative(20),
      updatedAt: isoRelative(18),
    },
  ];
}

export function createSeedStore(): AppStore {
  const now = nowIso();
  const jobs = seedJobs();
  const candidates = seedCandidates();

  const candidateContacts = [
    {
      id: createId("contact"),
      candidateId: candidates[0].id,
      type: "email" as const,
      value: "farzana.rahman@example.com",
      provenance: "manual" as const,
      isPrimary: true,
      createdAt: now,
    },
    {
      id: createId("contact"),
      candidateId: candidates[1].id,
      type: "phone" as const,
      value: "+8801712345678",
      provenance: "manual" as const,
      isPrimary: true,
      createdAt: now,
    },
    {
      id: createId("contact"),
      candidateId: candidates[2].id,
      type: "email" as const,
      value: "sadia.karim@example.com",
      provenance: "csv" as const,
      isPrimary: true,
      createdAt: now,
    },
  ];

  const candidateSources = candidates.map((candidate, index) => ({
    id: createId("source"),
    candidateId: candidate.id,
    sourceType: index === 3 ? "github_public" as const : "cv_upload" as const,
    importMethod: index === 3 ? "seed_public_profile" : "seed_cv_upload",
    url: candidate.portfolioUrls[0],
    confidence: index === 3 ? 0.82 : 0.9,
    collectedAt: candidate.createdAt,
  }));

  const jobWatchlists = jobs.map((job, index) => ({
    id: createId("watch"),
    jobId: job.id,
    title: `${job.title} watchlist`,
    source: index === 3 ? "github" as const : "internal" as const,
    query: index === 3 ? "bangladesh it support engineer" : `${job.title} bangladesh`,
    location: job.location,
    keywords: job.requiredSkills.slice(0, 3),
    skillCluster: job.requiredSkills,
    active: true,
    lastRunAt: isoRelative(1),
  }));

  const candidateJobMatches: CandidateJobMatch[] = jobs.flatMap((job) =>
    candidates.map((candidate) => {
      const result = scoreCandidateForJob(candidate, job);
      return {
        id: createId("match"),
        candidateId: candidate.id,
        jobId: job.id,
        score: result.score,
        scoreBreakdown: result.breakdown,
        recommendedNextAction: result.recommendedNextAction,
        status: result.score >= 75 ? "shortlisted" : "new",
        reviewedAt: result.score >= 75 ? isoRelative(2) : undefined,
        updatedAt: now,
      };
    }),
  );

  const stages: PipelineStage[] = ["reviewed", "screening", "contacted", "interview"];
  const pipelineEntries = candidateJobMatches.slice(0, 6).map((match, index) => ({
    id: createId("pipe"),
    candidateId: match.candidateId,
    jobId: match.jobId,
    stage: stages[index % stages.length],
    updatedAt: isoRelative(index + 1),
  }));

  const outreachEvents = [
    {
      id: createId("outreach"),
      candidateId: candidates[0].id,
      jobId: jobs[0].id,
      channel: "email" as const,
      templateId: "tpl-email-en",
      renderedSubject: `Opportunity: ${jobs[0].title}`,
      renderedBody: "Draft saved for first-touch outreach.",
      sentAt: isoRelative(7),
      replyState: "sent" as const,
      nextFollowUpAt: isoRelative(-1),
      createdAt: isoRelative(7),
    },
    {
      id: createId("outreach"),
      candidateId: candidates[1].id,
      jobId: jobs[1].id,
      channel: "whatsapp" as const,
      templateId: "tpl-whatsapp-en",
      renderedBody: "Drafted WhatsApp outreach for shortlist follow-up.",
      replyState: "draft" as const,
      createdAt: isoRelative(3),
    },
  ];

  return {
    version: 1,
    meta: {
      createdAt: now,
      updatedAt: now,
      workspaceLabel: WORKSPACE_LABEL,
    },
    users: [
      {
        id: createId("user"),
        fullName: "Dolon Hasnain",
        email: "dolonhasnain@gmail.com",
        location: "Dhaka",
        timezone: "Asia/Dhaka",
      },
    ],
    jobs,
    jobWatchlists,
    candidates,
    candidateContacts,
    candidateSources,
    candidateDocuments: [],
    candidateJobMatches,
    pipelineEntries,
    outreachTemplates: DEFAULT_OUTREACH_TEMPLATES,
    outreachEvents,
    notes: [
      {
        id: createId("note"),
        candidateId: candidates[0].id,
        body: "Strong newsroom fit. Needs scheduling confirmation.",
        createdAt: isoRelative(5),
      },
    ],
    tasks: [
      {
        id: createId("task"),
        candidateId: candidates[0].id,
        jobId: jobs[0].id,
        type: "follow_up",
        title: "Follow up on reporter outreach",
        dueAt: isoRelative(1),
        status: "open",
        createdAt: isoRelative(7),
      },
      {
        id: createId("task"),
        candidateId: candidates[1].id,
        jobId: jobs[1].id,
        type: "screening",
        title: "Review reel and shortlist",
        dueAt: isoRelative(-10),
        status: "open",
        createdAt: isoRelative(4),
      },
    ],
    activityEvents: [
      {
        id: createId("activity"),
        source: "System",
        message: "Starter workspace loaded with sample media and support roles.",
        createdAt: isoRelative(12),
      },
      {
        id: createId("activity"),
        source: "Workflow",
        message: "Daily refresh prepared reminder queue and rescored existing candidates.",
        createdAt: isoRelative(2),
      },
    ],
    importBatches: [
      {
        id: createId("import"),
        type: "resume",
        fileName: "starter-workspace",
        importedCount: candidates.length,
        createdAt: isoRelative(12),
      },
    ],
    dailyReview: {
      generatedAt: now,
      candidatesToReview: candidates.slice(0, 3).map((candidate) => candidate.id),
      dueTaskIds: [],
      watchlistSummary: ["4 active watchlists", "1 GitHub watchlist ready for refresh"],
    },
  };
}
