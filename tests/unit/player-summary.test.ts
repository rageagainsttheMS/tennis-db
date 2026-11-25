import { describe, expect, it } from "vitest";
import { eventOutcome, groupPlayerEvents, latestTitles, recentForm, winRate } from "@/lib/stats/player-summary";
import { findFinal, groupByRound } from "@/lib/stats/tournament-summary";
import type { Match } from "@/types";
import { makeMatchWithPlayers } from "../helpers/fixtures";

const ME = "player-dimitrov";
const OTHER = "player-rune";

/** A match where ME wins or loses. */
function played(won: boolean, overrides: Partial<Match> = {}) {
  return makeMatchWithPlayers({ winnerId: won ? ME : OTHER, loserId: won ? OTHER : ME, ...overrides });
}

describe("winRate", () => {
  it("rounds to a whole percentage and is null with no matches", () => {
    expect(winRate({ wins: 319, losses: 68 })).toBe(82);
    expect(winRate({ wins: 0, losses: 0 })).toBeNull();
  });
});

describe("recentForm", () => {
  it("lists results newest first, skipping walkovers", () => {
    const matches = [
      played(true, { id: 1, playedAt: new Date("2026-01-01") }),
      played(false, { id: 2, playedAt: new Date("2026-01-03") }),
      played(true, { id: 3, playedAt: new Date("2026-01-05"), status: "WALKOVER" }),
      played(true, { id: 4, playedAt: new Date("2026-01-02") }),
    ];
    expect(recentForm(matches, ME)).toEqual(["L", "W", "W"]);
    expect(recentForm(matches, ME, 1)).toEqual(["L"]);
  });
});

describe("latestTitles", () => {
  it("returns finals won, newest first", () => {
    const matches = [
      played(true, { id: 1, round: "F", playedAt: new Date("2025-06-01") }),
      played(false, { id: 2, round: "F", playedAt: new Date("2026-06-01") }),
      played(true, { id: 3, round: "SF", playedAt: new Date("2026-05-31") }),
      played(true, { id: 4, round: "F", playedAt: new Date("2026-08-01") }),
    ];
    expect(latestTitles(matches, ME).map((match) => match.id)).toEqual([4, 1]);
  });
});

describe("eventOutcome", () => {
  it("names champions, runners-up and the round lost in", () => {
    expect(eventOutcome([played(true, { round: "F" }), played(true, { round: "SF" })], ME)).toEqual({ kind: "champion", label: "Champion" });
    expect(eventOutcome([played(false, { round: "F" })], ME)).toEqual({ kind: "runner-up", label: "Runner-up" });
    expect(eventOutcome([played(false, { round: "R32" }), played(true, { round: "R64" })], ME)).toEqual({ kind: "lost", label: "Lost · Round of 32" });
    expect(eventOutcome([played(true, { round: "R16" })], ME)).toEqual({ kind: "none", label: null });
  });
});

describe("groupPlayerEvents", () => {
  it("groups by tournament and season, newest event first, with the date range", () => {
    const matches = [
      played(true, { id: 1, tournamentId: "paris", season: 2026, round: "R32", playedAt: new Date("2026-11-04") }),
      played(true, { id: 2, tournamentId: "paris", season: 2026, round: "F", playedAt: new Date("2026-11-08") }),
      played(false, { id: 3, tournamentId: "shanghai", season: 2026, round: "R32", playedAt: new Date("2026-10-12") }),
      played(true, { id: 4, tournamentId: "paris", season: 2025, round: "R32", playedAt: new Date("2025-11-01") }),
    ];
    const events = groupPlayerEvents(matches, ME);

    expect(events.map((event) => event.key)).toEqual(["paris-2026", "shanghai-2026", "paris-2025"]);
    expect(events[0].matches.map((match) => match.id)).toEqual([2, 1]);
    expect(events[0].start).toEqual(new Date("2026-11-04"));
    expect(events[0].end).toEqual(new Date("2026-11-08"));
    expect(events[0].outcome.kind).toBe("champion");
    expect(events[1].outcome.label).toBe("Lost · Round of 32");
  });
});

describe("tournament summary", () => {
  it("orders rounds final first and finds the final", () => {
    const matches = [
      played(true, { id: 1, round: "QF" }),
      played(true, { id: 2, round: "F" }),
      played(true, { id: 3, round: "SF" }),
      played(true, { id: 4, round: "QF", playedAt: new Date("2024-01-08T08:00:00Z") }),
    ];
    const rounds = groupByRound(matches);

    expect(rounds.map(([round]) => round)).toEqual(["F", "SF", "QF"]);
    expect(rounds[2][1].map((match) => match.id)).toEqual([4, 1]);
    expect(findFinal(matches)?.id).toBe(2);
    expect(findFinal([])).toBeNull();
  });
});
