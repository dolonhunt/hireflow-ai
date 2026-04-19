import { CandidateWorkbench } from "@/components/candidate-workbench";
import { PageIntro } from "@/components/ui";
import { getStore } from "@/lib/store";
import { getPrimaryContact } from "@/lib/selectors";

export default async function CandidatesPage() {
  const store = await getStore();

  const rows = store.candidates.map((candidate) => {
    const bestMatch = store.candidateJobMatches
      .filter((match) => match.candidateId === candidate.id)
      .sort((a, b) => b.score - a.score)[0];
    const primaryContact = getPrimaryContact(store, candidate.id);

    return {
      id: candidate.id,
      name: candidate.name,
      headline: candidate.headline,
      location: candidate.location,
      roleFamily: candidate.roleFamily,
      score: bestMatch?.score ?? 0,
      recommendedNextAction: bestMatch?.recommendedNextAction ?? "Needs manual review",
      contact: primaryContact?.value,
      skills: candidate.skills,
    };
  });

  return (
    <>
      <PageIntro
        eyebrow="Candidates"
        title="Candidate pool"
        description="Search the live pool, review strongest matches, and keep contact provenance visible so outreach stays grounded in real data."
      />
      <CandidateWorkbench rows={rows} />
    </>
  );
}
