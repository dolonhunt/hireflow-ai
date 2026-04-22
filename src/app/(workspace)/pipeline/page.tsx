import { PipelineBoard } from "@/components/pipeline-board";
import { PageIntro } from "@/components/ui";
import { getStore } from "@/lib/store";

export default async function PipelinePage() {
  const store = await getStore();
  const items = store.pipelineEntries.map((entry) => {
    const candidate = store.candidates.find((item) => item.id === entry.candidateId);
    const job = store.jobs.find((item) => item.id === entry.jobId);
    const match = store.candidateJobMatches.find((item) => item.candidateId === entry.candidateId && item.jobId === entry.jobId);

    return {
      entryId: entry.id,
      stage: entry.stage,
      candidateName: candidate?.name ?? "Candidate",
      jobTitle: job?.title ?? "Role",
      score: match?.score ?? 0,
      updatedAt: entry.updatedAt,
    };
  });

  return (
    <>
      <PageIntro
        eyebrow="Pipeline"
        title="Candidate progression"
        description="Move live candidate-job pairings through the funnel. Every change updates the dashboard and reminder queue."
      />
      <PipelineBoard items={items} />
    </>
  );
}
