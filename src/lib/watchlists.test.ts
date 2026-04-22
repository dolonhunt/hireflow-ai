import { describe, expect, it } from "vitest";
import { createSeedStore } from "@/lib/seed";
import { buildMorningReview, rebuildMatches } from "@/lib/recruitment-service";

describe("watchlist refresh helpers", () => {
  it("produces a morning review with active watchlist summaries", () => {
    const store = buildMorningReview(rebuildMatches(createSeedStore()));
    expect(store.dailyReview.watchlistSummary.length).toBeGreaterThan(0);
  });
});
