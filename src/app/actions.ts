"use server";

import { promises as fs } from "fs";
import path from "path";
import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ROLE_TEMPLATES } from "@/lib/constants";
import { createId, nowIso } from "@/lib/helpers";
import { fetchGitHubProfile } from "@/lib/github";
import { ingestPublicProfileUrl } from "@/lib/public-source";
import {
  buildCandidateFromText,
  buildCandidatesFromCsvText,
  buildMorningReview,
  createDocumentRecord,
  ensurePipelineEntry,
  extractTextFromFile,
  mergeCandidateRecords,
  rebuildMatches,
  renderTemplate,
  runWatchlistRefresh,
} from "@/lib/recruitment-service";
import { getStore, saveStore, updateStore } from "@/lib/store";

async function persistLocalUpload(file: File) {
  const uploadDir = path.join(process.cwd(), "data", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const targetPath = path.join(uploadDir, `${Date.now()}-${file.name}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(targetPath, buffer);
  return targetPath;
}

export async function createJobAction(formData: FormData) {
  const templateTitle = String(formData.get("templateTitle") || "");
  const title = String(formData.get("title") || "").trim();
  const base = ROLE_TEMPLATES.find((item) => item.title === templateTitle);
  const now = nowIso();

  if (!title) {
    redirect("/jobs?error=missing-title");
  }

  await updateStore((store) => {
    store.jobs.push({
      id: createId("job"),
      title,
      department: String(formData.get("department") || base?.department || "Recruitment"),
      roleFamily: String(formData.get("roleFamily") || base?.roleFamily || "operations") as never,
      location: String(formData.get("location") || base?.location || "Dhaka"),
      salaryMin: Number(formData.get("salaryMin") || base?.salaryMin || "") || undefined,
      salaryMax: Number(formData.get("salaryMax") || base?.salaryMax || "") || undefined,
      requiredSkills: String(formData.get("requiredSkills") || base?.requiredSkills.join(", ") || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      requiredLanguages: String(formData.get("requiredLanguages") || base?.requiredLanguages.join(", ") || "Bangla, English")
        .split(",")
        .map((language) => language.trim())
        .filter(Boolean),
      experienceMinYears: Number(formData.get("experienceMinYears") || base?.experienceMinYears || 1),
      summary: String(formData.get("summary") || base?.summary || ""),
      requiresPortfolio: formData.get("requiresPortfolio") === "on" || Boolean(base?.requiresPortfolio),
      createdAt: now,
      updatedAt: now,
    });

    return rebuildMatches(buildMorningReview(store));
  });

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  redirect("/jobs?created=1");
}

export async function createWatchlistAction(formData: FormData) {
  await updateStore((store) => {
    store.jobWatchlists.push({
      id: createId("watch"),
      jobId: String(formData.get("jobId")),
      title: String(formData.get("title") || "New watchlist"),
      source: String(formData.get("source") || "internal") as never,
      query: String(formData.get("query") || ""),
      location: String(formData.get("location") || "") || undefined,
      keywords: String(formData.get("keywords") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      skillCluster: String(formData.get("skillCluster") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      active: true,
      lastRunAt: undefined,
    });

    return buildMorningReview(store);
  });

  revalidatePath("/jobs");
  redirect("/jobs?watchlist=1");
}

export async function addManualLeadAction(formData: FormData) {
  await updateStore((store) => {
    const now = nowIso();
    const sourceUrl = String(formData.get("sourceUrl") || "");
    const { candidate, contacts } = buildCandidateFromText(
      [
        String(formData.get("headline") || ""),
        String(formData.get("summary") || ""),
        String(formData.get("email") || ""),
        String(formData.get("phone") || ""),
      ].join("\n"),
      String(formData.get("name") || "Manual Lead"),
      "manual_social",
    );

    candidate.location = String(formData.get("location") || "Bangladesh");
    candidate.roleFamily = String(formData.get("roleFamily") || "operations") as never;
    candidate.tags = ["manual-social", String(formData.get("platform") || "lead")].filter(Boolean);
    candidate.updatedAt = now;

    const source = {
      id: createId("source"),
      candidateId: candidate.id,
      sourceType: "manual_social" as const,
      importMethod: String(formData.get("platform") || "manual_social"),
      url: sourceUrl,
      confidence: 0.7,
      collectedAt: now,
    };

    const merged = mergeCandidateRecords(store, candidate, contacts, source);
    const selectedJobId = String(formData.get("jobId") || "");
    if (selectedJobId) ensurePipelineEntry(store, merged.id, selectedJobId);

    store.activityEvents.unshift({
      id: createId("activity"),
      source: "Manual Lead",
      message: `Saved ${merged.name} from ${String(formData.get("platform") || "manual source")}`,
      createdAt: now,
    });

    return buildMorningReview(rebuildMatches(store));
  });

  revalidatePath("/imports");
  revalidatePath("/candidates");
  revalidatePath("/dashboard");
  redirect("/imports?lead=1");
}

export async function importResumeAction(formData: FormData) {
  const file = formData.get("resume") as File | null;

  if (!file || !file.size) {
    redirect("/imports?error=resume-missing");
  }

  const extractedText = await extractTextFromFile(file);
  await persistLocalUpload(file);

  await updateStore((store) => {
    const { candidate, contacts } = buildCandidateFromText(
      extractedText,
      String(formData.get("candidateName") || file.name.replace(/\.[^.]+$/, "")),
      "cv_upload",
    );
    const document = createDocumentRecord(candidate.id, file, extractedText);
    document.storagePath = `uploads/${file.name}`;
    const source = {
      id: createId("source"),
      candidateId: candidate.id,
      sourceType: "cv_upload" as const,
      importMethod: "resume_upload",
      confidence: 0.92,
      collectedAt: nowIso(),
    };

    const merged = mergeCandidateRecords(store, candidate, contacts, source, document);
    const selectedJobId = String(formData.get("jobId") || "");
    if (selectedJobId) ensurePipelineEntry(store, merged.id, selectedJobId);

    store.importBatches.unshift({
      id: createId("import"),
      type: "resume",
      fileName: file.name,
      importedCount: 1,
      createdAt: nowIso(),
    });

    store.activityEvents.unshift({
      id: createId("activity"),
      source: "Resume",
      message: `Parsed ${file.name} and updated candidate pool`,
      createdAt: nowIso(),
    });

    return buildMorningReview(rebuildMatches(store));
  });

  revalidatePath("/imports");
  revalidatePath("/candidates");
  redirect("/imports?resume=1");
}

export async function importCsvAction(formData: FormData) {
  const file = formData.get("csvFile") as File | null;
  let csvText = String(formData.get("csvText") || "");

  if (file && file.size) {
    csvText = Buffer.from(await file.arrayBuffer()).toString("utf-8");
  }

  if (!csvText.trim()) {
    redirect("/imports?error=csv-missing");
  }

  const imported = buildCandidatesFromCsvText(csvText);

  await updateStore((store) => {
    imported.forEach(({ candidate, contacts, source }) => {
      mergeCandidateRecords(store, candidate, contacts, source);
    });

    store.importBatches.unshift({
      id: createId("import"),
      type: "csv",
      fileName: file?.name || "pasted-csv",
      importedCount: imported.length,
      createdAt: nowIso(),
    });

    store.activityEvents.unshift({
      id: createId("activity"),
      source: "CSV",
      message: `Imported ${imported.length} candidates from CSV`,
      createdAt: nowIso(),
    });

    return buildMorningReview(rebuildMatches(store));
  });

  revalidatePath("/imports");
  revalidatePath("/candidates");
  redirect("/imports?csv=1");
}

export async function importGithubProfileAction(formData: FormData) {
  const input = String(formData.get("githubProfile") || "").trim();
  if (!input) {
    redirect("/imports?error=github-missing");
  }

  const profile = await fetchGitHubProfile(input);
  await updateStore((store) => {
    const merged = mergeCandidateRecords(store, profile.candidate, profile.contacts, profile.source);
    store.activityEvents.unshift({
      id: createId("activity"),
      source: "GitHub",
      message: `Imported public GitHub profile for ${merged.name}`,
      createdAt: nowIso(),
    });
    return buildMorningReview(rebuildMatches(store));
  });

  revalidatePath("/imports");
  revalidatePath("/candidates");
  redirect("/imports?github=1");
}

export async function importPublicUrlAction(formData: FormData) {
  const input = String(formData.get("publicUrl") || "").trim();
  if (!input) {
    redirect("/imports?error=url-missing");
  }

  const publicProfile = await ingestPublicProfileUrl(input);
  await updateStore((store) => {
    const merged = mergeCandidateRecords(store, publicProfile.candidate, publicProfile.contacts, publicProfile.source);
    store.activityEvents.unshift({
      id: createId("activity"),
      source: "Public URL",
      message: `Imported profile summary for ${merged.name}`,
      createdAt: nowIso(),
    });
    return buildMorningReview(rebuildMatches(store));
  });

  revalidatePath("/imports");
  revalidatePath("/candidates");
  redirect("/imports?public=1");
}

export async function movePipelineStageAction(formData: FormData) {
  const entryId = String(formData.get("entryId"));
  const stage = String(formData.get("stage"));

  await updateStore((store) => {
    const entry = store.pipelineEntries.find((item) => item.id === entryId);
    if (entry) {
      entry.stage = stage as never;
      entry.updatedAt = nowIso();
    }
    return buildMorningReview(store);
  });

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
}

export async function createOutreachDraftAction(formData: FormData) {
  const store = await getStore();
  const candidate = store.candidates.find((item) => item.id === String(formData.get("candidateId")));
  const template = store.outreachTemplates.find((item) => item.id === String(formData.get("templateId")));
  const job = store.jobs.find((item) => item.id === String(formData.get("jobId")));

  if (!candidate || !template) {
    redirect("/outreach?error=template-or-candidate");
  }

  const rendered = renderTemplate(template, candidate, job, store.users[0]?.fullName || "Recruiter");
  await updateStore((mutableStore) => {
    mutableStore.outreachEvents.unshift({
      id: createId("outreach"),
      candidateId: candidate.id,
      jobId: job?.id,
      channel: template.channel,
      templateId: template.id,
      renderedSubject: rendered.subject,
      renderedBody: rendered.body,
      replyState: "draft",
      nextFollowUpAt: addDays(new Date(), 2).toISOString(),
      createdAt: nowIso(),
    });

    mutableStore.tasks.unshift({
      id: createId("task"),
      candidateId: candidate.id,
      jobId: job?.id,
      type: "follow_up",
      title: `Follow up with ${candidate.name}`,
      dueAt: addDays(new Date(), 2).toISOString(),
      status: "open",
      createdAt: nowIso(),
    });

    mutableStore.activityEvents.unshift({
      id: createId("activity"),
      source: "Outreach",
      message: `Created ${template.channel} draft for ${candidate.name}`,
      createdAt: nowIso(),
    });

    return buildMorningReview(mutableStore);
  });

  revalidatePath("/outreach");
  revalidatePath("/dashboard");
  redirect("/outreach?draft=1");
}

export async function completeTaskAction(formData: FormData) {
  const taskId = String(formData.get("taskId"));
  await updateStore((store) => {
    const task = store.tasks.find((item) => item.id === taskId);
    if (task) task.status = "done";
    return buildMorningReview(store);
  });

  revalidatePath("/workflow");
  revalidatePath("/dashboard");
}

export async function runDailyRefreshAction() {
  const store = await getStore();
  const updated = await runWatchlistRefresh(store);
  await saveStore(updated);
  revalidatePath("/dashboard");
  revalidatePath("/workflow");
  revalidatePath("/jobs");
  redirect("/workflow?refresh=1");
}
