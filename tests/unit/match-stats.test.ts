import { describe, expect, it } from "vitest";
import { getServeStats, percentage } from "@/lib/stats/match-stats";
import { makeMatch } from "../helpers/fixtures";

describe("percentage", () => {
  it("rounds to a whole number", () => {
    expect(percentage(1, 3)).toBe(33);
    expect(percentage(2, 3)).toBe(67);
  });

  it.each([
    [5, 0],
    [5, null],
    [null, 10],
    [0, 10],
    [5, -1],
  ])("returns 0 for part=%s, whole=%s", (part, whole) => {
    expect(percentage(part, whole)).toBe(0);
  });
});

describe("getServeStats", () => {
  it("computes the winner's serve stats", () => {
    expect(getServeStats(makeMatch(), "winner")).toEqual({
      aces: 12,
      doubleFaults: 2,
      firstServePercentage: 63, // 50 / 80
      firstServeWinPercentage: 80, // 40 / 50
      secondServeWinPercentage: 60, // 18 / (80 - 50)
      breakPoints: "3/4",
      serviceGames: 11,
      servicePointsWon: 58, // 40 + 18
    });
  });

  it("computes the loser's serve stats from the loser columns", () => {
    expect(getServeStats(makeMatch(), "loser")).toEqual({
      aces: 5,
      doubleFaults: 4,
      firstServePercentage: 50, // 35 / 70
      firstServeWinPercentage: 71, // 25 / 35
      secondServeWinPercentage: 40, // 14 / (70 - 35)
      breakPoints: "1/2",
      serviceGames: 10,
      servicePointsWon: 39,
    });
  });

  it("treats missing stats as zero (walkovers and retirements have none)", () => {
    const match = makeMatch({
      winnerAces: null,
      winnerDoubleFaults: null,
      winnerServicePointsPlayed: null,
      winner1stServeIn: null,
      winner1stServeWon: null,
      winner2ndServeWon: null,
      winnerServeGames: null,
      winnerBreakPointSaved: null,
      winnerBreakPointFaced: null,
    });

    expect(getServeStats(match, "winner")).toEqual({
      aces: 0,
      doubleFaults: 0,
      firstServePercentage: 0,
      firstServeWinPercentage: 0,
      secondServeWinPercentage: 0,
      breakPoints: "0/0",
      serviceGames: 0,
      servicePointsWon: 0,
    });
  });

  it("doesn't divide by zero when every first serve went in", () => {
    const match = makeMatch({ winnerServicePointsPlayed: 50, winner1stServeIn: 50, winner2ndServeWon: 0 });
    const stats = getServeStats(match, "winner");

    expect(stats.secondServeWinPercentage).toBe(0);
    expect(Number.isFinite(stats.secondServeWinPercentage)).toBe(true);
  });
});
