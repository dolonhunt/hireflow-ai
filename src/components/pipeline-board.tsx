import { movePipelineStageAction } from "@/app/actions";
import { Badge, Panel, SectionHeading } from "@/components/ui";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/constants";

type PipelineCard = {
  entryId: string;
  stage: string;
  candidateName: string;
  jobTitle: string;
  score: number;
  updatedAt: string;
};

export function PipelineBoard({ items }: { items: PipelineCard[] }) {
  return (
    <Panel>
      <SectionHeading
        eyebrow="Hiring flow"
        title="Pipeline board"
        description="Each card is a live candidate-job pairing. Move stages directly to keep the dashboard, reminders, and outreach views in sync."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageItems = items.filter((item) => item.stage === stage);
          return (
            <section key={stage} className="rounded-[24px] border border-border bg-surface p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-primary-strong">{STAGE_LABELS[stage]}</h3>
                <Badge>{stageItems.length}</Badge>
              </div>
              <div className="space-y-3">
                {stageItems.map((item) => (
                  <article key={item.entryId} className="rounded-[20px] border border-border bg-background px-3 py-3">
                    <p className="font-semibold text-primary-strong">{item.candidateName}</p>
                    <p className="mt-1 text-sm text-text-soft">{item.jobTitle}</p>
                    <p className="mt-2 text-sm font-medium text-primary">{item.score}% match</p>
                    <form action={movePipelineStageAction} className="mt-3 space-y-2">
                      <input type="hidden" name="entryId" value={item.entryId} />
                      <select
                        name="stage"
                        defaultValue={item.stage}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                      >
                        {PIPELINE_STAGES.map((option) => (
                          <option key={option} value={option}>
                            {STAGE_LABELS[option]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
                      >
                        Update stage
                      </button>
                    </form>
                  </article>
                ))}
                {!stageItems.length ? (
                  <div className="rounded-[18px] border border-dashed border-border bg-surface-muted/50 px-3 py-6 text-center text-sm text-text-soft">
                    No candidates here yet.
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </Panel>
  );
}
