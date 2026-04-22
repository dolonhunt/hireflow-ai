import { formatDistanceToNow } from "date-fns";
import { completeTaskAction, runDailyRefreshAction } from "@/app/actions";
import { Badge, PageIntro, Panel, SectionHeading } from "@/components/ui";
import { getStore } from "@/lib/store";
import { getDueTasks } from "@/lib/selectors";

export default async function WorkflowPage() {
  const store = await getStore();
  const dueTasks = getDueTasks(store);

  return (
    <>
      <PageIntro
        eyebrow="Workflow"
        title="Refresh and review workflow"
        description="This is the daily operating loop: refresh watchlists, re-score candidates, review the queue, and clear due reminders."
        aside={
          <form action={runDailyRefreshAction}>
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong">
              Run daily refresh
            </button>
          </form>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <SectionHeading eyebrow="Morning review" title="Daily queue" description="A simple, recruiter-first list of what to act on right now." />
          <div className="space-y-3">
            {store.dailyReview.watchlistSummary.map((summary) => (
              <div key={summary} className="rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-primary-strong">
                {summary}
              </div>
            ))}
            <div className="rounded-2xl border border-border bg-background px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-soft">Candidates to review</p>
              <p className="mt-2 text-3xl font-black text-primary-strong">{store.dailyReview.candidatesToReview.length}</p>
            </div>
          </div>
        </Panel>

        <Panel>
          <SectionHeading eyebrow="Reminders" title="Due tasks" description="Keep follow-ups timely without paid automation tools." />
          <div className="space-y-3">
            {dueTasks.map((task) => {
              const candidate = store.candidates.find((item) => item.id === task.candidateId);
              return (
                <div key={task.id} className="rounded-[22px] border border-border bg-surface px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-primary-strong">{task.title}</p>
                        <Badge tone="accent">{task.type}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-text-soft">
                        {candidate?.name ?? "Candidate"} · due {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}
                      </p>
                    </div>
                    <form action={completeTaskAction}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong">
                        Complete
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel className="mt-5">
        <SectionHeading eyebrow="Watchlists" title="Refresh coverage" description="Visibility into which searches are active and when they last ran." />
        <div className="space-y-3">
          {store.jobWatchlists.map((watchlist) => (
            <div key={watchlist.id} className="flex flex-col gap-2 rounded-[22px] border border-border bg-surface px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-primary-strong">{watchlist.title}</p>
                <p className="mt-1 text-sm text-text-soft">{watchlist.source} · {watchlist.query}</p>
              </div>
              <Badge>{watchlist.lastRunAt ? formatDistanceToNow(new Date(watchlist.lastRunAt), { addSuffix: true }) : "not run yet"}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
