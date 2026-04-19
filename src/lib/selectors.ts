import { isToday, parseISO } from "date-fns";
import { average } from "@/lib/helpers";
import { AppStore, DashboardMetrics, Job, PipelineStage } from "@/lib/types";

export function getDashboardMetrics(store: AppStore): DashboardMetrics {
  const pipelineStages: PipelineStage[] = ["contacted", "screening", "interview", "offer"];
  const scores = store.candidateJobMatches.map((match) => match.score);
  const sentCount = store.outreachEvents.filter((event) => event.replyState !== "draft").length;
  const repliedCount = store.outreachEvents.filter((event) => event.replyState === "replied").length;

  return {
    totalCandidates: store.candidates.length,
    newToday: store.candidates.filter((candidate) => isToday(parseISO(candidate.createdAt))).length,
    inPipeline: store.pipelineEntries.filter((entry) => pipelineStages.includes(entry.stage)).length,
    interviews: store.pipelineEntries.filter((entry) => entry.stage === "interview").length,
    offersSent: store.pipelineEntries.filter((entry) => entry.stage === "offer").length,
    hired: store.pipelineEntries.filter((entry) => entry.stage === "hired").length,
    averageScore: average(scores),
    responseRate: sentCount ? Math.round((repliedCount / sentCount) * 100) : 0,
  };
}

export function getJobMap(store: AppStore) {
  return new Map(store.jobs.map((job) => [job.id, job]));
}

export function getCandidateMap(store: AppStore) {
  return new Map(store.candidates.map((candidate) => [candidate.id, candidate]));
}

export function getPrimaryContact(store: AppStore, candidateId: string) {
  return (
    store.candidateContacts.find((contact) => contact.candidateId === candidateId && contact.isPrimary) ??
    store.candidateContacts.find((contact) => contact.candidateId === candidateId)
  );
}

export function getTopMatches(store: AppStore, limit = 5) {
  return [...store.candidateJobMatches].sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getDueTasks(store: AppStore) {
  return store.tasks
    .filter((task) => task.status === "open")
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export function getPipelineByStage(store: AppStore) {
  return store.pipelineEntries.reduce<Record<PipelineStage, typeof store.pipelineEntries>>(
    (accumulator, entry) => {
      accumulator[entry.stage].push(entry);
      return accumulator;
    },
    {
      new: [],
      reviewed: [],
      contacted: [],
      screening: [],
      interview: [],
      offer: [],
      hired: [],
      rejected: [],
    },
  );
}

export function getJobWatchlistsForJob(store: AppStore, job: Job) {
  return store.jobWatchlists.filter((watchlist) => watchlist.jobId === job.id);
}
