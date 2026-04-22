import { NextResponse } from "next/server";
import { buildCandidatesCsv } from "@/lib/csv";
import { getStore } from "@/lib/store";
import { getPrimaryContact } from "@/lib/selectors";

export async function GET() {
  try {
    const store = await getStore();
    const rows = store.candidates.map((candidate) => {
      const primaryContact = getPrimaryContact(store, candidate.id);
      return {
        name: candidate.name,
        headline: candidate.headline,
        location: candidate.location,
        email: primaryContact?.type === "email" ? primaryContact.value : "",
        phone: primaryContact?.type === "phone" ? primaryContact.value : "",
        skills: candidate.skills,
        sourceUrl: candidate.portfolioUrls[0],
      };
    });

    const csv = buildCandidatesCsv(rows);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hireflow-candidates-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export candidates" },
      { status: 500 }
    );
  }
}