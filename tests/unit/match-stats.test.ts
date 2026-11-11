import { describe, expect, it } from "vitest";
import { getSideStats, getStatRows, latestRank, winLoss } from "@/lib/stats/match-stats";
import { makeMatch } from "../helpers/fixtures";

describe("getSideStats", () => {
  it("reads each side's own columns", () => {
    expect(getSideStats(makeMatch(), "winner")).toEqual({
      aces: 12,
      doubleFaults: 2,
      servicePointsWonPct: 73,
      returnPointsWonPct: 39,
      breakPointsWonPct: 50,
      breakPointsSavedPct: 100,
    });
    expect(getSideStats(makeMatch(), "loser")).toEqual({
      aces: 5,
      doubleFaults: 4,
      servicePointsWonPct: 61,
      returnPointsWonPct: 27,
      breakPointsWonPct: 0,
      breakPointsSavedPct: 50,
    });
  });
});

describe("getStatRows", () => {
  it("formats counts and percentages, keeping a real zero", () => {
    expect(getStatRows(makeMatch())).toEqual([
      { label: "Aces", winner: "12", loser: "5" },
      { label: "Double faults", winner: "2", loser: "4" },
      { label: "Service points won", winner: "73%", loser: "61%" },
      { label: "Return points won", winner: "39%", loser: "27%" },
      { label: "Break points converted", winner: "50%", loser: "0%" },
      { label: "Break points saved", winner: "100%", loser: "50%" },
    ]);
  });

  it("shows a dash when only one player has a value", () => {
    const rows = getStatRows(makeMatch({ loserAces: null }));

    expect(rows.find((row) => row.label === "Aces")).toEqual({ label: "Aces", winner: "12", loser: "-" });
  });

  it("leaves out a statistic neither player has", () => {
    const rows = getStatRows(makeMatch({ winnerBreakPointsSavedPct: null, loserBreakPointsSavedPct: null }));

    expect(rows.map((row) => row.label)).not.toContain("Break points saved");
  });

  it("returns no rows for a walkover, which has no statistics", () => {
    const empty = {
      winnerAces: null, loserAces: null, winnerDoubleFaults: null, loserDoubleFaults: null,
      winnerServicePointsWonPct: null, loserServicePointsWonPct: null, winnerReturnPointsWonPct: null,
      loserReturnPointsWonPct: null, winnerBreakPointsWonPct: null, loserBreakPointsWonPct: null,
      winnerBreakPointsSavedPct: null, loserBreakPointsSavedPct: null,
    };

    expect(getStatRows(makeMatch({ status: "WALKOVER", ...empty }))).toEqual([]);
  });
});

describe("latestRank", () => {
  const me = "player-dimitrov";

  it("uses the player's rank at their most recent match, from either side", () => {
    const matches = [
      makeMatch({ playedAt: new Date("2024-01-07"), winnerId: me, winnerRank: 14 }),
      makeMatch({ playedAt: new Date("2024-06-01"), winnerId: "other", loserId: me, loserRank: 10 }),
      makeMatch({ playedAt: new Date("2024-03-01"), winnerId: me, winnerRank: 12 }),
    ];

    expect(latestRank(matches, me)).toEqual({ rank: 10, asOf: new Date("2024-06-01") });
  });

  it("skips matches where the source has no rank", () => {
    const matches = [
      makeMatch({ playedAt: new Date("2024-06-01"), winnerId: me, winnerRank: null }),
      makeMatch({ playedAt: new Date("2024-01-07"), winnerId: me, winnerRank: 14 }),
    ];

    expect(latestRank(matches, me)?.rank).toBe(14);
  });

  it("returns null when no match has a rank", () => {
    expect(latestRank([makeMatch({ winnerId: me, winnerRank: null })], me)).toBeNull();
    expect(latestRank([], me)).toBeNull();
  });
});

describe("winLoss", () => {
  it("counts wins and losses, but not walkovers", () => {
    const me = "player-dimitrov";
    const matches = [
      makeMatch({ winnerId: me }),
      makeMatch({ winnerId: me }),
      makeMatch({ winnerId: "other", loserId: me }),
      makeMatch({ winnerId: me, status: "WALKOVER" }),
      makeMatch({ winnerId: me, status: "RETIRED" }),
    ];

    expect(winLoss(matches, me)).toEqual({ wins: 3, losses: 1 });
  });
});
