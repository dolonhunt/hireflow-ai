import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const serverSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export interface AggregatedJob {
  id: string;
  source: string;
  sourceUrl: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  deadline: string;
  description: string;
  requirements: string[];
  postedAt: string;
  fetchedAt: string;
}

async function fetchBdjobsJobs(): Promise<AggregatedJob[]> {
  const jobs: AggregatedJob[] = [];
  
  try {
    const response = await fetch("https://bdjobs.com/h/jobs?lang=en&JobType=new", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HireFlowAI/1.0)",
      },
    });
    
    if (response.ok) {
      const html = await response.text();
      const titleMatch = html.match(/<a[^>]*class="[^"]*jobtitle[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi);
      const companyMatch = html.match(/<a[^>]*class="[^"]*company[^"]*"[^>]*>([^<]*)<\/a>/gi);
      const locationMatch = html.match(/<span[^>]*class="[^"]*location[^"]*"[^>]*>([^<]*)<\/a>/gi);
      
      if (titleMatch) {
        titleMatch.slice(0, 20).forEach((match, index) => {
          const urlMatch = match.match(/href="([^"]*)"/);
          const titleContent = match.match(/>([^<]*)<\/a>/);
          
          jobs.push({
            id: `bdjobs-${Date.now()}-${index}`,
            source: "BDJobs",
            sourceUrl: urlMatch ? `https://www.bdjobs.com${urlMatch[1]}` : "https://www.bdjobs.com",
            title: titleContent ? titleContent[1].trim() : "Job Position",
            company: (companyMatch?.[index]?.match(/>([^<]*)</)?.[1] || "Various Company").trim(),
            location: (locationMatch?.[index]?.match(/>([^<]*)/)?.[1] || "Bangladesh").trim(),
            jobType: "Full Time",
            salary: "Negotiable",
            deadline: "",
            description: "",
            requirements: [],
            postedAt: new Date().toISOString(),
            fetchedAt: new Date().toISOString(),
          });
        });
      }
    }
  } catch (error) {
    console.error("Error fetching BDJobs:", error);
  }
  
  return jobs;
}

async function fetchCareerjetJobs(): Promise<AggregatedJob[]> {
  const jobs: AggregatedJob[] = [];
  
  try {
    const response = await fetch("https://www.careerjet.com/bangladesh/jobs.html", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HireFlowAI/1.0)",
      },
    });
    
    if (response.ok) {
      const html = await response.text();
      const jobMatches = html.matchAll(/<a[^>]*class="[^"]*job[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi);
      
      let index = 0;
      for (const match of jobMatches) {
        if (index >= 20) break;
        
        jobs.push({
          id: `careerjet-${Date.now()}-${index}`,
          source: "CareerJet",
          sourceUrl: match[1].startsWith("http") ? match[1] : `https://www.careerjet.com${match[1]}`,
          title: match[2].trim(),
          company: "Multiple Companies",
          location: "Bangladesh",
          jobType: "Full Time",
          salary: "Negotiable",
          deadline: "",
          description: "",
          requirements: [],
          postedAt: new Date().toISOString(),
          fetchedAt: new Date().toISOString(),
        });
        
        index++;
      }
    }
  } catch (error) {
    console.error("Error fetching CareerJet:", error);
  }
  
  return jobs;
}

async function fetchJobsBDJobs(): Promise<AggregatedJob[]> {
  const jobs: AggregatedJob[] = [];
  
  try {
    const response = await fetch("https://jobs.bd/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HireFlowAI/1.0)",
      },
    });
    
    if (response.ok) {
      const html = await response.text();
      const titleMatches = html.matchAll(/<h3[^>]*>([^<]*)<\/h3>/gi);
      
      let index = 0;
      for (const match of titleMatches) {
        if (index >= 15) break;
        
        jobs.push({
          id: `jobsbd-${Date.now()}-${index}`,
          source: "Jobs.bd",
          sourceUrl: "https://jobs.bd",
          title: match[1].trim(),
          company: "Various Companies",
          location: "Bangladesh",
          jobType: "Full Time",
          salary: "Negotiable",
          deadline: "",
          description: "",
          requirements: [],
          postedAt: new Date().toISOString(),
          fetchedAt: new Date().toISOString(),
        });
        
        index++;
      }
    }
  } catch (error) {
    console.error("Error fetching Jobs.bd:", error);
  }
  
  return jobs;
}

export async function aggregateAllJobs(): Promise<AggregatedJob[]> {
  const [bdjobs, careerjet, jobsbd] = await Promise.allSettled([
    fetchBdjobsJobs(),
    fetchCareerjetJobs(),
    fetchJobsBDJobs(),
  ]);
  
  const allJobs: AggregatedJob[] = [];
  
  if (bdjobs.status === "fulfilled") allJobs.push(...bdjobs.value);
  if (careerjet.status === "fulfilled") allJobs.push(...careerjet.value);
  if (jobsbd.status === "fulfilled") allJobs.push(...jobsbd.value);
  
  return allJobs;
}

export async function saveAggregatedJobs(jobs: AggregatedJob[]) {
  if (!supabaseUrl || !supabaseKey) {
    console.log("Supabase not configured, skipping job save");
    return;
  }
  
  const { error } = await serverSupabase.from("aggregated_jobs").upsert(
    jobs.map((job) => ({
      id: job.id,
      source: job.source,
      source_url: job.sourceUrl,
      title: job.title,
      company: job.company,
      location: job.location,
      job_type: job.jobType,
      salary: job.salary,
      deadline: job.deadline,
      description: job.description,
      requirements: job.requirements,
      posted_at: job.postedAt,
      fetched_at: job.fetchedAt,
    })),
    { onConflict: "id" }
  );
  
  if (error) {
    console.error("Error saving aggregated jobs:", error);
  }
}

export async function getAggregatedJobsFromDB(): Promise<AggregatedJob[]> {
  if (!supabaseUrl || !supabaseKey) {
    return [];
  }
  
  const { data, error } = await serverSupabase
    .from("aggregated_jobs")
    .select("*")
    .order("fetched_at", { ascending: false })
    .limit(100);
  
  if (error) {
    console.error("Error fetching aggregated jobs:", error);
    return [];
  }
  
  return (data || []).map((row) => ({
    id: row.id,
    source: row.source,
    sourceUrl: row.source_url,
    title: row.title,
    company: row.company,
    location: row.location,
    jobType: row.job_type,
    salary: row.salary,
    deadline: row.deadline,
    description: row.description,
    requirements: row.requirements || [],
    postedAt: row.posted_at,
    fetchedAt: row.fetched_at,
  }));
}
