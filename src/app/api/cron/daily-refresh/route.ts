import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/store";
import { runWatchlistRefresh } from "@/lib/recruitment-service";

export async function POST(request: NextRequest) {
  try {
    const configuredSecret = process.env.HIREFLOW_CRON_SECRET;
    const incomingSecret = request.headers.get("x-hireflow-secret");

    if (configuredSecret && incomingSecret !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const store = await getStore();
    const updated = await runWatchlistRefresh(store);
    await saveStore(updated);

    return NextResponse.json({
      refreshedAt: updated.dailyReview.generatedAt,
      watchlists: updated.dailyReview.watchlistSummary,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to run daily refresh" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    message: "Cron endpoint is working"
  });
}