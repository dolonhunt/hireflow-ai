import { z } from "zod";

export const jobSchema = z.object({
  templateTitle: z.string().optional(),
  title: z.string().min(1, "Job title is required").max(100),
  department: z.string().max(100).optional(),
  roleFamily: z.enum(["editorial", "multimedia", "production", "design", "growth", "finance", "hr", "it", "operations"]).optional(),
  location: z.string().max(100).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  requiredSkills: z.string().optional(),
  requiredLanguages: z.string().optional(),
  experienceMinYears: z.coerce.number().min(0).max(50).optional(),
  summary: z.string().max(500).optional(),
  requiresPortfolio: z.boolean().optional(),
});

export const watchlistSchema = z.object({
  jobId: z.string().min(1, "Job is required"),
  title: z.string().min(1, "Title is required").max(100),
  source: z.enum(["internal", "github", "public_web"]).optional(),
  query: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  keywords: z.string().optional(),
  skillCluster: z.string().optional(),
});

export const manualLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  platform: z.enum(["linkedin", "facebook", "messenger", "manual_social"]).optional(),
  headline: z.string().max(140).optional(),
  location: z.string().max(100).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  sourceUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  roleFamily: z.enum(["editorial", "multimedia", "production", "design", "growth", "finance", "hr", "it", "operations"]).optional(),
  jobId: z.string().optional(),
  summary: z.string().max(1000).optional(),
});

export const resumeImportSchema = z.object({
  candidateName: z.string().max(100).optional(),
  jobId: z.string().optional(),
  resume: z.instanceof(File).refine((file) => file.size > 0, "Resume file is required"),
});

export const csvImportSchema = z.object({
  csvText: z.string().optional(),
});

export const githubProfileSchema = z.object({
  githubProfile: z.string().min(1, "GitHub username or URL is required"),
});

export const publicUrlSchema = z.object({
  publicUrl: z.string().url("Invalid URL").min(1, "URL is required"),
});

export const outreachDraftSchema = z.object({
  candidateId: z.string().min(1, "Candidate is required"),
  jobId: z.string().optional(),
  templateId: z.string().min(1, "Template is required"),
});

export const pipelineStageSchema = z.object({
  entryId: z.string().min(1, "Entry ID is required"),
  stage: z.enum(["new", "reviewed", "contacted", "screening", "interview", "offer", "hired", "rejected"]),
});

export const taskCompleteSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
});

export function validateFormData<T extends z.ZodSchema>(
  schema: T,
  formData: FormData
): z.infer<T> | { errors: z.ZodError } {
  const data: Record<string, unknown> = {};
  
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      data[key] = value;
    } else {
      data[key] = value;
    }
  }
  
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return { errors: result.error };
  }
  
  return result.data;
}

export function getFormErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}