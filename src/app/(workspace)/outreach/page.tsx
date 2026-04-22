import { createOutreachDraftAction } from "@/app/actions";
import { Badge, PageIntro, Panel, SectionHeading } from "@/components/ui";
import { getStore } from "@/lib/store";

export default async function OutreachPage() {
  const store = await getStore();

  return (
    <>
      <PageIntro
        eyebrow="Outreach"
        title="Templates and drafts"
        description="Create recruiter-approved drafts for email, WhatsApp, phone, and follow-up without relying on risky automation."
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel>
          <SectionHeading eyebrow="New draft" title="Generate outreach" description="Pick the candidate, role, and template. The rendered draft is stored with a follow-up task." />
          <form action={createOutreachDraftAction} className="space-y-3">
            <select name="candidateId" className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
              {store.candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
            <select name="jobId" className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
              {store.jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <select name="templateId" className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
              {store.outreachTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} · {template.channel} · {template.language}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong">
              Create draft
            </button>
          </form>
        </Panel>

        <Panel>
          <SectionHeading eyebrow="Template library" title="Reusable messaging" description="English-first with Bangla-ready variants for candidate-facing communication." />
          <div className="space-y-3">
            {store.outreachTemplates.map((template) => (
              <article key={template.id} className="rounded-[22px] border border-border bg-surface px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-primary-strong">{template.name}</h3>
                  <Badge>{template.channel}</Badge>
                  <Badge>{template.language}</Badge>
                </div>
                {template.subject ? <p className="mt-2 text-sm font-medium text-primary">{template.subject}</p> : null}
                <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-text-soft">{template.body}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-5">
        <SectionHeading eyebrow="Recent drafts" title="Outreach history" description="Track rendered drafts, sent messages, and reply states in one place." />
        <div className="space-y-3">
          {store.outreachEvents.map((event) => {
            const candidate = store.candidates.find((item) => item.id === event.candidateId);
            return (
              <article key={event.id} className="rounded-[22px] border border-border bg-surface px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-primary-strong">{candidate?.name ?? "Candidate"}</p>
                  <Badge>{event.channel}</Badge>
                  <Badge tone={event.replyState === "replied" ? "success" : event.replyState === "draft" ? "default" : "accent"}>
                    {event.replyState}
                  </Badge>
                </div>
                {event.renderedSubject ? <p className="mt-2 text-sm font-medium text-primary">{event.renderedSubject}</p> : null}
                <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-text-soft">{event.renderedBody}</p>
              </article>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
