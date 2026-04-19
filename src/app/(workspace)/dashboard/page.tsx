import { formatDistanceToNow } from "date-fns";
import { completeTaskAction } from "@/app/actions";
import { Badge, MetricCard, PageIntro, Panel, SectionHeading } from "@/components/ui";
import { getStore } from "@/lib/store";
import { getCandidateMap, getDashboardMetrics, getDueTasks, getJobMap, getTopMatches } from "@/lib/selectors";

export default async function DashboardPage() {
  const store = await getStore();
  const metrics = getDashboardMetrics(store);
  const candidateMap = getCandidateMap(store);
  const jobMap = getJobMap(store);
  const topMatches = getTopMatches(store, 5);
  const dueTasks = getDueTasks(store).slice(0, 5);
  const sourceCounts = store.candidateSources.reduce<Record<string, number>>((accumulator, source) => {
    accumulator[source.sourceType] = (accumulator[source.sourceType] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <>
      <PageIntro
        eyebrow="Dashboard"
        title="Recruitment Dashboard"
        description="A truthful operating view across sourcing, scoring, outreach, and follow-ups for Bangladesh media and support-role hiring."
        aside={
          <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-right shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-soft">Updated</p>
            <p className="mt-1 text-sm font-semibold text-primary-strong">
              {formatDistanceToNow(new Date(store.meta.updatedAt), { addSuffix: true })}
            </p>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total candidates" value={metrics.totalCandidates} hint="Live workspace count" />
        <MetricCard label="New today" value={metrics.newToday} hint="Fresh additions since midnight" />
        <MetricCard label="In pipeline" value={metrics.inPipeline} hint="Contacted, screening, interview, or offer stages" />
        <MetricCard label="Average score" value={`${metrics.averageScore}%`} hint="Explainable fit score across candidate-job matches" />
        <MetricCard label="Interviews" value={metrics.interviews} hint="Candidates currently in interview stage" />
        <MetricCard label="Offers sent" value={metrics.offersSent} hint="Offer-stage entries ready for decision" />
        <MetricCard label="Hired" value={metrics.hired} hint="Accepted and onboarded candidates" />
        <MetricCard label="Response rate" value={`${metrics.responseRate}%`} hint="Based on sent outreach events that received replies" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <SectionHeading
            eyebrow="Top matches"
            title="Highest-ranked candidates"
            description="The scoring engine stays explainable and updates after imports, job changes, and refresh runs."
          />
          <div className="space-y-3">
            {topMatches.map((match) => {
              const candidate = candidateMap.get(match.candidateId);
              const job = jobMap.get(match.jobId);
              if (!candidate || !job) return null;
              return (
                <article key={match.id} className="rounded-[22px] border border-border bg-surface px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-primary-strong">{candidate.name}</h3>
                        <Badge tone={match.score >= 80 ? "success" : "accent"}>{match.score}%</Badge>
                      </div>
                      <p className="mt-1 text-sm text-text-soft">{candidate.headline}</p>
                      <p className="mt-2 text-sm text-primary">{job.title}</p>
                    </div>
                    <p className="max-w-xs text-sm text-text-soft">{match.recommendedNextAction}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Daily review"
            title="Morning queue"
            description="A quick view of what needs action first."
          />
          <div className="space-y-3">
            {store.dailyReview.watchlistSummary.map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-primary-strong">
                {item}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <SectionHeading eyebrow="Source mix" title="Candidate sources" description="Only approved public or candidate-provided sources are automated." />
          <div className="space-y-3">
            {Object.entries(sourceCounts).map(([source, count]) => (
              <div key={source}>
                <div className="mb-1 flex items-center justify-between text-sm text-primary-strong">
                  <span>{source}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(8, (count / store.candidateSources.length) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeading eyebrow="Due tasks" title="Follow-ups and reminders" description="Close the loop quickly so candidates do not go cold." />
          <div className="space-y-3">
            {dueTasks.map((task) => {
              const candidate = candidateMap.get(task.candidateId);
              return (
                <div key={task.id} className="flex flex-col gap-3 rounded-[22px] border border-border bg-surface px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-primary-strong">{task.title}</p>
                    <p className="mt-1 text-sm text-text-soft">{candidate?.name ?? "Candidate"} · due {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}</p>
                  </div>
                  <form action={completeTaskAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong">
                      Mark done
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel className="mt-5">
        <SectionHeading eyebrow="Recent activity" title="System and recruiter activity" description="Only real actions are shown here. No fabricated sourcing logs." />
        <div className="space-y-3">
          {store.activityEvents.slice(0, 8).map((event) => (
            <div key={event.id} className="rounded-[22px] border border-border bg-surface px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-primary-strong">{event.source}</p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-soft">
                  {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                </p>
              </div>
              <p className="mt-2 text-sm text-text-soft">{event.message}</p>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
