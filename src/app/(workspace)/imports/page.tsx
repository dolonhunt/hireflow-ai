import {
  addManualLeadAction,
  importCsvAction,
  importGithubProfileAction,
  importPublicUrlAction,
  importResumeAction,
  runDailyRefreshAction,
} from "@/app/actions";
import { PageIntro, Panel, SectionHeading } from "@/components/ui";
import { QuickImport } from "@/components/quick-import";
import { ROLE_FAMILY_LABELS } from "@/lib/constants";
import { getStore } from "@/lib/store";

export default async function ImportsPage() {
  const store = await getStore();

  return (
    <>
      <PageIntro
        eyebrow="Imports"
        title="Compliant sourcing and imports"
        description="Bring in candidate data through manual social leads, CV uploads, CSV files, GitHub public profiles, and approved public URLs."
        aside={
          <div className="flex gap-3">
            <form action={runDailyRefreshAction}>
              <button
                type="submit"
                className="rounded-2xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary-strong hover:bg-surface-muted"
              >
                Refresh Now
              </button>
            </form>
            <a
              href="/api/export/candidates"
              className="inline-flex rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
            >
              Export candidates CSV
            </a>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel>
          <SectionHeading
            eyebrow="Quick import"
            title="Paste candidate info"
            description="Paste any text or fill the form to quickly add a candidate."
          />
          <QuickImport />
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Manual social lead"
            title="Save LinkedIn or Facebook lead"
            description="Store visible details and your notes without scraping or hidden extraction."
          />
          <form action={addManualLeadAction} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="name"
                placeholder="Candidate name"
                required
                className="rounded-2xl border border-border bg-surface px-4 py-3"
              />
              <select name="platform" className="rounded-2xl border border-border bg-surface px-4 py-3">
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="messenger">Messenger</option>
              </select>
              <input name="headline" placeholder="Headline or visible role" className="rounded-2xl border border-border bg-surface px-4 py-3" />
              <input name="location" placeholder="Location" className="rounded-2xl border border-border bg-surface px-4 py-3" />
              <input name="email" placeholder="Visible email (optional)" type="email" className="rounded-2xl border border-border bg-surface px-4 py-3" />
              <input name="phone" placeholder="Visible phone (optional)" type="tel" className="rounded-2xl border border-border bg-surface px-4 py-3" />
              <input
                name="sourceUrl"
                placeholder="Profile URL"
                type="url"
                className="rounded-2xl border border-border bg-surface px-4 py-3 md:col-span-2"
              />
              <select name="roleFamily" className="rounded-2xl border border-border bg-surface px-4 py-3">
                {Object.entries(ROLE_FAMILY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select name="jobId" className="rounded-2xl border border-border bg-surface px-4 py-3">
                <option value="">No job yet</option>
                {store.jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              name="summary"
              rows={3}
              placeholder="Notes, visible skills, or screening observations"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
            />
            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
            >
              Save lead
            </button>
          </form>
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Resume intake"
            title="Upload CV or resume"
            description="Extract contact info, text, and candidate summary from PDF, DOCX, or text-based resumes."
          />
          <form action={importResumeAction} className="space-y-3">
            <input
              name="candidateName"
              placeholder="Candidate name (optional)"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
            />
            <select name="jobId" className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
              <option value="">No job yet</option>
              {store.jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <input
              type="file"
              name="resume"
              accept=".pdf,.docx,.txt"
              required
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-strong"
            />
            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
            >
              Parse resume
            </button>
          </form>
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="CSV import"
            title="Import owned spreadsheets"
            description="Paste CSV text or upload a CSV file from your own pipeline exports or form responses."
          />
          <form action={importCsvAction} className="space-y-3">
            <input type="file" name="csvFile" accept=".csv" className="w-full rounded-2xl border border-border bg-surface px-4 py-3" />
            <textarea
              name="csvText"
              rows={6}
              placeholder="Name,Headline,Location,Email,Phone,Skills,SourceUrl"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 font-mono text-sm"
            />
            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
            >
              Import CSV
            </button>
          </form>
        </Panel>

        <Panel className="xl:col-span-2">
          <SectionHeading
            eyebrow="Approved public sources"
            title="GitHub and public URL import"
            description="Use approved public profile fields and portfolio pages, then decide what to do next manually."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <form action={importGithubProfileAction} className="space-y-3">
              <input
                name="githubProfile"
                placeholder="GitHub username or profile URL"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
              />
              <button
                type="submit"
                className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
              >
                Import GitHub profile
              </button>
            </form>

            <form action={importPublicUrlAction} className="space-y-3">
              <input
                name="publicUrl"
                placeholder="Public portfolio or newsroom URL"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
              />
              <button
                type="submit"
                className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
              >
                Import public URL
              </button>
            </form>
          </div>
        </Panel>
      </div>

      <Panel className="mt-5">
        <SectionHeading
          eyebrow="Recent imports"
          title="Import history"
          description="A live audit trail of what entered the pool and how."
        />
        <div className="space-y-3">
          {store.importBatches.map((batch) => (
            <div key={batch.id} className="rounded-[22px] border border-border bg-surface px-4 py-4">
              <p className="font-semibold text-primary-strong">{batch.type}</p>
              <p className="mt-1 text-sm text-text-soft">
                {batch.fileName ?? "no filename"} · {batch.importedCount} records
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}