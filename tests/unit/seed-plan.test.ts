import { describe, expect, it } from "vitest";
import { normalizeRow, type NormalizedMatch, type RawSeedRow } from "@/db/seed/normalize";
import { chunk, planMatches } from "@/db/seed/plan";

function row(overrides: RawSeedRow): RawSeedRow {
  return {
    match_id: "1",
    season_year: "2025",
    tour_type: "1",
    date_timestamp: "1735689600",
    tournament: "Doha ATP",
    round: "Final",
    surface: "hard",
    status: "FINISHED",
    status_extra: "FINISHED",
    home_name: "Player A.",
    away_name: "Player B.",
    home_id: "1",
    away_id: "2",
    home_rank: "10",
    away_rank: "20",
    winner_code: "1",
    home_set_score: "2",
    away_set_score: "0",
    home_set_1_score: "6",
    away_set_1_score: "3",
    home_set_2_score: "6",
    away_set_2_score: "4",
    ...overrides,
  };
}

function match(overrides: RawSeedRow): NormalizedMatch {
  const result = normalizeRow(row(overrides));
  if (!result.ok) throw new Error(`fixture skipped: ${result.reason}`);
  return result.match;
}

describe("planMatches", () => {
  it("creates each player and tournament once", () => {
    const plan = planMatches([
      match({ match_id: "1", home_id: "1", away_id: "2" }),
      match({ match_id: "2", home_id: "1", away_id: "3", away_name: "Player C." }),
    ]);

    expect(plan.players.map((player) => player.sourceId).sort()).toEqual(["1", "2", "3"]);
    expect(plan.tournaments).toHaveLength(1);
    expect(plan.matches).toHaveLength(2);
  });

  it("takes player names and tournament details from the most recent match", () => {
    const plan = planMatches([
      match({ match_id: "2", date_timestamp: "1740000000", home_name: "Newname A.", season_year: "2025" }),
      match({ match_id: "1", date_timestamp: "1700000000", home_name: "Oldname A.", season_year: "2024" }),
    ]);

    expect(plan.players.find((player) => player.sourceId === "1")?.name).toBe("Newname A.");
    // Doha became an ATP 500 in 2025.
    expect(plan.tournaments[0]).toMatchObject({ id: "doha", tournamentType: "ATP500", season: 2025 });
  });

  it("keys matches by source player IDs and keeps the winner first", () => {
    const [planned] = planMatches([match({ winner_code: "2" })]).matches;

    expect(planned).toMatchObject({
      sourceMatchId: "1",
      tournamentId: "doha",
      winnerSourceId: "2",
      loserSourceId: "1",
      winnerRank: 20,
      loserRank: 10,
      round: "F",
      status: "COMPLETED",
    });
  });

  it("returns an empty plan for no matches", () => {
    expect(planMatches([])).toEqual({ players: [], tournaments: [], matches: [] });
  });
});

describe("chunk", () => {
  it("splits into batches of the given size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 500)).toEqual([]);
  });

  it("rejects a size below 1", () => {
    expect(() => chunk([1], 0)).toThrow();
  });
});
