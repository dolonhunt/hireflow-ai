export type RoleFamily =
  | "editorial"
  | "multimedia"
  | "production"
  | "design"
  | "growth"
  | "finance"
  | "hr"
  | "it"
  | "operations";

export type CandidateSourceType =
  | "manual_social"
  | "cv_upload"
  | "csv_import"
  | "github_public"
  | "public_portfolio"
  | "google_form"
  | "google_sheet";

export type CandidateContactType = "email" | "phone" | "whatsapp" | "messenger" | "url";
export type ContactProvenance = "manual" | "cv" | "csv" | "github" | "public_web" | "form";
export type MatchStatus = "new" | "reviewed" | "shortlisted" | "archived";
export type OutreachChannel = "email" | "whatsapp" | "phone" | "messenger";
export type TaskStatus = "open" | "done";
export type TaskType = "follow_up" | "screening" | "interview" | "review";
export type ImportBatchType = "manual_lead" | "resume" | "csv" | "github" | "public_url" | "refresh";
export type WatchlistSource = "internal" | "github" | "public_web";

export type PipelineStage =
  | "new"
  | "reviewed"
  | "contacted"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export interface User {
  id: string;
  fullName: string;
  email: string;
  location: string;
  timezone: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  roleFamily: RoleFamily;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string[];
  requiredLanguages: string[];
  experienceMinYears: number;
  summary: string;
  requiresPortfolio: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobWatchlist {
  id: string;
  jobId: string;
  title: string;
  source: WatchlistSource;
  query: string;
  location?: string;
  keywords: string[];
  skillCluster: string[];
  active: boolean;
  lastRunAt?: string;
}

export interface Candidate {
  id: string;
  name: string;
  headline: string;
  currentCompany?: string;
  currentRole?: string;
  location: string;
  roleFamily: RoleFamily;
  summary: string;
  yearsExperience: number;
  expectedSalary?: number;
  languages: string[];
  skills: string[];
  portfolioUrls: string[];
  lastActiveAt: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateContact {
  id: string;
  candidateId: string;
  type: CandidateContactType;
  value: string;
  provenance: ContactProvenance;
  isPrimary: boolean;
  createdAt: string;
}

export interface CandidateSource {
  id: string;
  candidateId: string;
  sourceType: CandidateSourceType;
  importMethod: string;
  url?: string;
  confidence: number;
  collectedAt: string;
}

export interface CandidateDocument {
  id: string;
  candidateId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  extractedText: string;
  hash: string;
  createdAt: string;
}

export interface ScoreBreakdown {
  titleFit: number;
  skillOverlap: number;
  experienceDepth: number;
  locationFit: number;
  salaryFit: number;
  languageFit: number;
  portfolioRelevance: number;
  recency: number;
  notes: string[];
}

export interface CandidateJobMatch {
  id: string;
  candidateId: string;
  jobId: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  recommendedNextAction: string;
  status: MatchStatus;
  reviewedAt?: string;
  updatedAt: string;
}

export interface PipelineEntry {
  id: string;
  candidateId: string;
  jobId: string;
  stage: PipelineStage;
  updatedAt: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  channel: OutreachChannel;
  language: "en" | "bn";
  subject?: string;
  body: string;
}

export interface OutreachEvent {
  id: string;
  candidateId: string;
  jobId?: string;
  channel: OutreachChannel;
  templateId: string;
  renderedSubject?: string;
  renderedBody: string;
  sentAt?: string;
  replyState: "draft" | "sent" | "replied" | "no_reply";
  nextFollowUpAt?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  candidateId: string;
  body: string;
  createdAt: string;
}

export interface Task {
  id: string;
  candidateId: string;
  jobId?: string;
  type: TaskType;
  title: string;
  dueAt: string;
  status: TaskStatus;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  source: string;
  message: string;
  createdAt: string;
}

export interface ImportBatch {
  id: string;
  type: ImportBatchType;
  fileName?: string;
  importedCount: number;
  createdAt: string;
}

export interface DailyReview {
  generatedAt: string;
  candidatesToReview: string[];
  dueTaskIds: string[];
  watchlistSummary: string[];
}

export interface AppStore {
  version: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    workspaceLabel: string;
  };
  users: User[];
  jobs: Job[];
  jobWatchlists: JobWatchlist[];
  candidates: Candidate[];
  candidateContacts: CandidateContact[];
  candidateSources: CandidateSource[];
  candidateDocuments: CandidateDocument[];
  candidateJobMatches: CandidateJobMatch[];
  pipelineEntries: PipelineEntry[];
  outreachTemplates: OutreachTemplate[];
  outreachEvents: OutreachEvent[];
  notes: Note[];
  tasks: Task[];
  activityEvents: ActivityEvent[];
  importBatches: ImportBatch[];
  dailyReview: DailyReview;
}

export interface DashboardMetrics {
  totalCandidates: number;
  newToday: number;
  inPipeline: number;
  interviews: number;
  offersSent: number;
  hired: number;
  averageScore: number;
  responseRate: number;
}
