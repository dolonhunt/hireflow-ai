import { addDays, isBefore } from "date-fns";
import { parseCandidateCsv } from "@/lib/csv";
import { findCandidateDuplicate } from "@/lib/dedupe";
import { extractContactsFromText } from "@/lib/contact-extractor";
import { createId, hashText, nowIso } from "@/lib/helpers";
import { searchGitHubUsers } from "@/lib/github";
import { scoreCandidateForJob } from "@/lib/scoring";
import { AppStore, Candidate, CandidateContact, CandidateDocument, CandidateSource, Job, PipelineStage } from "@/lib/types";

function buildMatchKey(candidateId: string, jobId: string) {
  return `${candidateId}:${jobId}`;
}

export function rebuildMatches(store: AppStore) {
  const existingMatches = new Map(
    store.candidateJobMatches.map((match) => [buildMatchKey(match.candidateId, match.jobId), match]),
  );

  store.candidateJobMatches = store.jobs.flatMap((job) =>
    store.candidates.map((candidate) => {
      const result = scoreCandidateForJob(candidate, job);
      const existing = existingMatches.get(buildMatchKey(candidate.id, job.id));

      return {
        id: existing?.id ?? createId("match"),
        candidateId: candidate.id,
        jobId: job.id,
        score: result.score,
        scoreBreakdown: result.breakdown,
        recommendedNextAction: result.recommendedNextAction,
        status: existing?.status ?? (result.score >= 75 ? "shortlisted" : "new"),
        reviewedAt: existing?.reviewedAt,
        updatedAt: nowIso(),
      };
    }),
  );

  return store;
}

export function ensurePipelineEntry(store: AppStore, candidateId: string, jobId: string, stage: PipelineStage = "new") {
  const existing = store.pipelineEntries.find((entry) => entry.candidateId === candidateId && entry.jobId === jobId);
  if (existing) {
    return existing;
  }

  const entry = {
    id: createId("pipe"),
    candidateId,
    jobId,
    stage,
    updatedAt: nowIso(),
  };
  store.pipelineEntries.push(entry);
  return entry;
}

export function mergeCandidateRecords(
  store: AppStore,
  candidate: Candidate,
  contacts: CandidateContact[],
  source: CandidateSource,
  document?: CandidateDocument,
) {
  const duplicate = findCandidateDuplicate(
    store.candidates,
    store.candidateContacts,
    store.candidateSources,
    store.candidateDocuments,
    {
      name: candidate.name,
      contacts,
      sourceUrl: source.url,
      documentHash: document?.hash,
    },
  );

  if (duplicate) {
    duplicate.updatedAt = nowIso();
    duplicate.headline = duplicate.headline || candidate.headline;
    duplicate.summary = duplicate.summary || candidate.summary;
    duplicate.skills = Array.from(new Set([...duplicate.skills, ...candidate.skills]));
    duplicate.portfolioUrls = Array.from(new Set([...duplicate.portfolioUrls, ...candidate.portfolioUrls]));
    duplicate.tags = Array.from(new Set([...duplicate.tags, ...candidate.tags]));
    duplicate.languages = Array.from(new Set([...duplicate.languages, ...candidate.languages]));
    duplicate.expectedSalary = duplicate.expectedSalary ?? candidate.expectedSalary;

    contacts.forEach((contact) => {
      if (!store.candidateContacts.some((item) => item.candidateId === duplicate.id && item.type === contact.type && item.value === contact.value)) {
        store.candidateContacts.push({ ...contact, candidateId: duplicate.id });
      }
    });

    if (!store.candidateSources.some((item) => item.candidateId === duplicate.id && item.url === source.url)) {
      store.candidateSources.push({ ...source, candidateId: duplicate.id });
    }

    if (document && !store.candidateDocuments.some((item) => item.hash === document.hash)) {
      store.candidateDocuments.push({ ...document, candidateId: duplicate.id });
    }

    return duplicate;
  }

  store.candidates.push(candidate);
  store.candidateContacts.push(...contacts);
  store.candidateSources.push(source);
  if (document) store.candidateDocuments.push(document);
  return candidate;
}

export async function extractTextFromFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  if (lowerName.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }

  return buffer.toString("utf-8");
}

export function buildCandidateFromText(text: string, fallbackName: string, sourceType: CandidateSource["sourceType"]) {
  const contacts = extractContactsFromText(text);
  
  // Extended skill list for better parsing
  const allSkills = [
    // Media & Editorial
    "Reporting", "News Writing", "Research", "Interviewing", "News Desk", "Feature Writing", "Breaking News", 
    "Copy Editing", "Proofreading", "Journalism", "Content Writing", "SEO Writing", "Technical Writing",
    // Multimedia
    "Premiere Pro", "After Effects", "Final Cut Pro", "DaVinci Resolve", "Video Editing", "Motion Graphics",
    "Animation", "Visual Effects", "Color Correction", "Sound Design", "Video Production",
    // Design
    "Figma", "Photoshop", "Illustrator", "InDesign", "Canva", "UI Design", "UX Design", "Graphic Design",
    "Logo Design", "Branding", "Print Design", "Web Design", "Motion Design",
    // Finance
    "Excel", "Budgeting", "Tally", "Financial Reporting", "Accounting", "Auditing", "Tax", "VAT",
    "SAP", "Oracle", "QuickBooks", "Xero", "Financial Analysis", "Cost Accounting",
    // IT & Tech
    "Networking", "Windows Administration", "Google Workspace", "Help Desk", "IT Support", "System Admin",
    "Linux", "AWS", "Azure", "Docker", "Kubernetes", "Python", "JavaScript", "React", "Node.js",
    "SQL", "MongoDB", "Cyber Security", "CCNA", "MCSA",
    // Marketing & Growth
    "Meta Ads", "Google Analytics", "Google Ads", "Facebook Ads", "Instagram Marketing", "Content Marketing",
    "Digital Marketing", "SEO", "SEM", "Email Marketing", "Lead Generation", "Marketing Strategy",
    // Operations & HR
    "Recruitment", "Interview Coordination", "Employee Relations", "HRIS", "HRM", "Training",
    "Project Management", "Agile", "Scrum", "Supply Chain", "Logistics", "Operations",
    // Other
    "Teaching", "Training", "Sales", "Customer Service", "Public Speaking", " Bengali", " English"
  ];
  
  const foundSkills = allSkills.filter((skill) => text.toLowerCase().includes(skill.toLowerCase()));
  
  // Detect experience years
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?|years\s+of\s+experience)/i);
  const yearsExp = expMatch ? parseInt(expMatch[1]) : 2;
  
  // Detect expected salary
  const salaryMatch = text.match(/(?:bdt|tk|৳|salary|expected)\s*[:\-]?\s*([0-9,]+)/i);
  const salary = salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, "")) : undefined;
  
  // Detect location
  const locations = ["Dhaka", "Chattogram", "Chittagong", "Sylhet", "Khulna", "Rajshahi", "Rangpur", "Barishal", "Mymensingh", "Bangladesh"];
  const foundLocation = locations.find((loc) => text.toLowerCase().includes(loc.toLowerCase())) || "Bangladesh";
  
  // Detect role family
  const roleFamily = 
    text.toLowerCase().includes("report") || text.toLowerCase().includes("journal") || text.toLowerCase().includes("news") || text.toLowerCase().includes("editor")
      ? "editorial"
      : text.toLowerCase().includes("video") || text.toLowerCase().includes("motion") || text.toLowerCase().includes("premiere") || text.toLowerCase().includes("after effects")
        ? "multimedia"
        : text.toLowerCase().includes("design") || text.toLowerCase().includes("figma") || text.toLowerCase().includes("photoshop") || text.toLowerCase().includes("illustrator")
          ? "design"
          : text.toLowerCase().includes("finance") || text.toLowerCase().includes("account") || text.toLowerCase().includes("budget")
            ? "finance"
            : text.toLowerCase().includes("hr") || text.toLowerCase().includes("recruit") || text.toLowerCase().includes("human")
              ? "hr"
              : text.toLowerCase().includes("it") || text.toLowerCase().includes("tech") || text.toLowerCase().includes("network")
                ? "it"
                : text.toLowerCase().includes("marketing") || text.toLowerCase().includes("digital") || text.toLowerCase().includes("sales")
                  ? "growth"
                  : "operations";

  const now = nowIso();
  const candidate: Candidate = {
    id: createId("cand"),
    name: fallbackName || text.split("\n").find(Boolean)?.trim() || "Imported Candidate",
    headline: text.split("\n").slice(0, 2).join(" ").slice(0, 140) || "Imported profile",
    currentCompany: undefined,
    currentRole: undefined,
    location: foundLocation,
    roleFamily: roleFamily as never,
    summary: text.replace(/\s+/g, " ").slice(0, 280),
    yearsExperience: yearsExp,
    expectedSalary: salary,
    languages: [
      ...(text.toLowerCase().includes("bengali") || text.toLowerCase().includes("bangla") || text.toLowerCase().includes("বাংলা") ? ["Bangla"] : []),
      ...(text.toLowerCase().includes("english") || text.toLowerCase().includes("eng") ? ["English"] : []),
    ],
    skills: foundSkills,
    portfolioUrls: contacts.urls,
    lastActiveAt: now,
    tags: [sourceType],
    createdAt: now,
    updatedAt: now,
  };

  const contactRecords: CandidateContact[] = [
    ...contacts.emails.map((value, index) => ({
      id: createId("contact"),
      candidateId: candidate.id,
      type: "email" as const,
      value,
      provenance: sourceType === "cv_upload" ? "cv" as const : "manual" as const,
      isPrimary: index === 0,
      createdAt: now,
    })),
    ...contacts.phones.map((value, index) => ({
      id: createId("contact"),
      candidateId: candidate.id,
      type: "phone" as const,
      value,
      provenance: sourceType === "cv_upload" ? "cv" as const : "manual" as const,
      isPrimary: contacts.emails.length === 0 && index === 0,
      createdAt: now,
    })),
  ];

  return { candidate, contacts: contactRecords };
}

export function renderTemplate(template: AppStore["outreachTemplates"][number], candidate: Candidate, job?: Job, recruiterName = "Recruiter") {
  const replacements: Record<string, string> = {
    candidate_name: candidate.name,
    headline: candidate.headline,
    recruiter_name: recruiterName,
    top_skill: candidate.skills[0] ?? "your profile",
    job_title: job?.title ?? "current role",
    job_location: job?.location ?? "Dhaka",
  };

  const render = (value: string) =>
    value.replace(/\{\{(.*?)\}\}/g, (_, key) => replacements[key.trim()] ?? "");

  return {
    subject: template.subject ? render(template.subject) : undefined,
    body: render(template.body),
  };
}

export function buildMorningReview(store: AppStore) {
  const dueTaskIds = store.tasks
    .filter((task) => task.status === "open" && isBefore(new Date(task.dueAt), addDays(new Date(), 1)))
    .map((task) => task.id);

  const topUnreviewed = store.candidateJobMatches
    .filter((match) => match.score >= 75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((match) => match.candidateId);

  store.dailyReview = {
    generatedAt: nowIso(),
    candidatesToReview: Array.from(new Set(topUnreviewed)),
    dueTaskIds,
    watchlistSummary: store.jobWatchlists.filter((watchlist) => watchlist.active).map((watchlist) => `${watchlist.title} ready`),
  };

  return store;
}

export async function runWatchlistRefresh(store: AppStore) {
  const messages: string[] = [];

  for (const watchlist of store.jobWatchlists.filter((item) => item.active)) {
    watchlist.lastRunAt = nowIso();
    if (watchlist.source === "github") {
      const results = await searchGitHubUsers(watchlist.query);
      messages.push(`${watchlist.title}: ${results.length} GitHub public profiles found`);
    } else {
      messages.push(`${watchlist.title}: internal pool rescored`);
    }
  }

  store.activityEvents.unshift(
    ...messages.map((message) => ({
      id: createId("activity"),
      source: "Refresh",
      message,
      createdAt: nowIso(),
    })),
  );

  return buildMorningReview(rebuildMatches(store));
}

export function buildCandidatesFromCsvText(csvText: string) {
  return parseCandidateCsv(csvText).map((row) => {
    const now = nowIso();
    const candidate: Candidate = {
      id: createId("cand"),
      name: row.name,
      headline: row.headline || "Imported from CSV",
      currentCompany: undefined,
      currentRole: undefined,
      location: row.location,
      roleFamily: "operations",
      summary: `${row.headline || "Imported lead"} from CSV import`,
      yearsExperience: 2,
      expectedSalary: undefined,
      languages: ["Bangla", "English"],
      skills: row.skills,
      portfolioUrls: row.sourceUrl ? [row.sourceUrl] : [],
      lastActiveAt: now,
      tags: ["csv"],
      createdAt: now,
      updatedAt: now,
    };

    const contacts: CandidateContact[] = [
      ...(row.email
        ? [
            {
              id: createId("contact"),
              candidateId: candidate.id,
              type: "email" as const,
              value: row.email,
              provenance: "csv" as const,
              isPrimary: true,
              createdAt: now,
            },
          ]
        : []),
      ...(row.phone
        ? [
            {
              id: createId("contact"),
              candidateId: candidate.id,
              type: "phone" as const,
              value: row.phone,
              provenance: "csv" as const,
              isPrimary: !row.email,
              createdAt: now,
            },
          ]
        : []),
    ];

    const source: CandidateSource = {
      id: createId("source"),
      candidateId: candidate.id,
      sourceType: "csv_import",
      importMethod: "csv_upload",
      url: row.sourceUrl,
      confidence: 0.8,
      collectedAt: now,
    };

    return { candidate, contacts, source };
  });
}

export function createDocumentRecord(candidateId: string, file: File, extractedText: string) {
  return {
    id: createId("doc"),
    candidateId,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    storagePath: `local/${file.name}`,
    extractedText,
    hash: hashText(extractedText),
    createdAt: nowIso(),
  };
}
