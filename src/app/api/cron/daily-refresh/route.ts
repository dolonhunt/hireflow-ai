import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/store";
import { runWatchlistRefresh } from "@/lib/recruitment-service";

async function runDailyRefresh() {
  const store = await getStore();
  const updated = await runWatchlistRefresh(store);
  await saveStore(updated);

  return NextResponse.json({
    refreshedAt: updated.dailyReview.generatedAt,
    watchlists: updated.dailyReview.watchlistSummary,
  });
}

function isAuthorizedCron(request: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET || process.env.HIREFLOW_CRON_SECRET;
  if (!configuredSecret) {
    return true;
  }

  const authorizationHeader = request.headers.get("authorization");
  const customSecretHeader = request.headers.get("x-hireflow-secret");

  return authorizationHeader === `Bearer ${configuredSecret}` || customSecretHeader === configuredSecret;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedCron(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return await runDailyRefresh();
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to run daily refresh" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedCron(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return await runDailyRefresh();
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to run daily refresh" },
      { status: 500 }
    );
  }
}
