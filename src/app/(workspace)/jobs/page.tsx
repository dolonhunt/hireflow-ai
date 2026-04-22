import { createJobAction, createWatchlistAction } from "@/app/actions";
import { Badge, PageIntro, Panel, SectionHeading } from "@/components/ui";
import { ROLE_FAMILY_LABELS, ROLE_TEMPLATES } from "@/lib/constants";
import { getStore } from "@/lib/store";
import { getJobWatchlistsForJob } from "@/lib/selectors";

export default async function JobsPage() {
  const store = await getStore();

  return (
    <>
      <PageIntro
        eyebrow="Jobs"
        title="Jobs and watchlists"
        description="Create real searches for media and support roles, then keep compliant watchlists running against approved sources and your internal pool."
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel>
          <SectionHeading eyebrow="New job" title="Create a role" description="Start from a Bangladesh-ready template and adjust skills, salary, and location." />
          <form action={createJobAction} className="space-y-3">
            <select name="templateTitle" className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
              <option value="">Select a template</option>
              {ROLE_TEMPLATES.map((template) => (
                <option key={template.title} value={template.title}>
                  {template.title}
                </option>
              ))}
            </select>
            <input name="title" placeholder="Job title" className="w-full rounded-2xl border border-border bg-surface px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <input name="department" placeholder="Department" className="rounded-2xl border border-border bg-surface px-4 py-3" />
              <select name="roleFamily" className="rounded-2xl border border-border bg-surface px-4 py-3">
                {Object.entries(ROLE_FAMILY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input name="location" placeholder="Location" className="rounded-2xl border border-border bg-surface px-4 py-3" />
              <input name="experienceMinYears" type="number" min="0" placeholder="Minimum years" className="rounded-2xl border border-border bg-surface px-4 py-3" />
              <input name="salaryMin" type="number" placeholder="Salary min (BDT)" className="rounded-2xl border border-border bg-surface px-4 py-3" />
              <input name="salaryMax" type="number" placeholder="Salary max (BDT)" className="rounded-2xl border border-border bg-surface px-4 py-3" />
            </div>
            <input
              name="requiredSkills"
              placeholder="Required skills, comma-separated"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
            />
            <input
              name="requiredLanguages"
              placeholder="Required languages, comma-separated"
              defaultValue="Bangla, English"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
            />
            <textarea
              name="summary"
              rows={4}
              placeholder="Role summary"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
            />
            <label className="flex items-center gap-2 text-sm text-text-soft">
              <input type="checkbox" name="requiresPortfolio" />
              Requires portfolio or work samples
            </label>
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong">
              Save job
            </button>
          </form>
        </Panel>

        <Panel>
          <SectionHeading eyebrow="Watchlists" title="Create a watchlist" description="Tie one query to one job so daily refresh stays easy to review." />
          <form action={createWatchlistAction} className="space-y-3">
            <select name="jobId" className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
              {store.jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input name="title" placeholder="Watchlist title" className="rounded-2xl border border-border bg-surface px-4 py-3" />
              <select name="source" className="rounded-2xl border border-border bg-surface px-4 py-3">
                <option value="internal">Internal pool</option>
                <option value="github">GitHub public</option>
                <option value="public_web">Public web</option>
              </select>
            </div>
            <input name="query" placeholder="Query or source phrase" className="w-full rounded-2xl border border-border bg-surface px-4 py-3" />
            <input name="keywords" placeholder="Keywords, comma-separated" className="w-full rounded-2xl border border-border bg-surface px-4 py-3" />
            <input name="skillCluster" placeholder="Skill cluster, comma-separated" className="w-full rounded-2xl border border-border bg-surface px-4 py-3" />
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong">
              Save watchlist
            </button>
          </form>
        </Panel>
      </div>

      <Panel className="mt-5">
        <SectionHeading eyebrow="Open roles" title="Current jobs" description="Each role keeps its own skills, salary band, and watchlist coverage." />
        <div className="grid gap-4 lg:grid-cols-2">
          {store.jobs.map((job) => {
            const watchlists = getJobWatchlistsForJob(store, job);
            return (
              <article key={job.id} className="rounded-[24px] border border-border bg-surface px-5 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-primary-strong">{job.title}</h3>
                  <Badge>{ROLE_FAMILY_LABELS[job.roleFamily]}</Badge>
                </div>
                <p className="mt-2 text-sm text-text-soft">{job.summary}</p>
                <p className="mt-3 text-sm font-medium text-primary">
                  {job.location} · {job.salaryMin ? `BDT ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}` : "Salary not set"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {watchlists.map((watchlist) => (
                    <div key={watchlist.id} className="rounded-2xl border border-border bg-background px-3 py-3 text-sm">
                      <p className="font-semibold text-primary-strong">{watchlist.title}</p>
                      <p className="mt-1 text-text-soft">{watchlist.source} · {watchlist.query}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
