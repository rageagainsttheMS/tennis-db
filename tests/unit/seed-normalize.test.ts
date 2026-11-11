import { describe, expect, it } from "vitest";
import { normalizeRow, type NormalizedMatch, type RawSeedRow } from "@/db/seed/normalize";
import { parseTournamentName, slugify } from "@/db/seed/tournaments";

/** A finished ATP Tour match: the away player (Rune) beats the home player (Dimitrov) 6-7 6-3 6-4. */
function makeRow(overrides: RawSeedRow = {}): RawSeedRow {
  return {
    match_id: "75191598",
    season_year: "2024",
    tour_type: "1",
    tour_type_human: "ATP Tour",
    date_timestamp: "1704614400", // 2024-01-07T08:00:00Z
    date_human: "07 Jan 2024",
    tournament: "Brisbane ATP",
    round: "Final",
    surface: "hard",
    surface_id: "1",
    status: "FINISHED",
    status_extra: "FINISHED",
    home_name: "Dimitrov G.",
    away_name: "Rune H.",
    home_id: "111",
    away_id: "222",
    home_rank: "14",
    away_rank: "8",
    home_points: "2570",
    away_points: "3660",
    winner_code: "2",
    home_set_score: "1",
    away_set_score: "2",
    home_set_1_score: "7",
    away_set_1_score: "6",
    home_set_2_score: "3",
    away_set_2_score: "6",
    home_set_3_score: "4",
    away_set_3_score: "6",
    home_set_4_score: "",
    away_set_4_score: "",
    home_set_5_score: "",
    away_set_5_score: "",
    home_odds_match_winner: "1.8",
    away_odds_match_winner: "2.0",
    home_aces: "12",
    away_aces: "5",
    home_double_faults: "2",
    away_double_faults: "4",
    home_service_points_won_perc: "68",
    away_service_points_won_perc: "71",
    home_return_points_won_perc: "29",
    away_return_points_won_perc: "32",
    home_break_points_won_perc: "33",
    away_break_points_won_perc: "50",
    home_break_points_saved_perc: "50",
    away_break_points_saved_perc: "67",
    ...overrides,
  };
}

function normalized(overrides: RawSeedRow = {}): NormalizedMatch {
  const result = normalizeRow(makeRow(overrides));
  if (!result.ok) throw new Error(`expected a match, got skip: ${result.reason} ${result.detail ?? ""}`);
  return result.match;
}

function skipReason(overrides: RawSeedRow) {
  const result = normalizeRow(makeRow(overrides));
  return result.ok ? "not skipped" : result.reason;
}

describe("normalizeRow: winner and loser", () => {
  it("maps the away player to the winner when winner_code is 2", () => {
    const match = normalized();

    expect(match.winner).toMatchObject({ sourceId: "222", name: "Rune H.", rank: 8, rankingPoints: 3660, setsWon: 2, aces: 5 });
    expect(match.loser).toMatchObject({ sourceId: "111", name: "Dimitrov G.", rank: 14, setsWon: 1, aces: 12 });
  });

  it("maps the home player to the winner when winner_code is 1", () => {
    const match = normalized({ winner_code: "1" });

    expect(match.winner.sourceId).toBe("111");
    expect(match.loser.sourceId).toBe("222");
  });

  it("keeps each player's own statistics", () => {
    const { winner, loser } = normalized();

    expect(winner).toMatchObject({
      doubleFaults: 4,
      servicePointsWonPct: 71,
      returnPointsWonPct: 32,
      breakPointsWonPct: 50,
      breakPointsSavedPct: 67,
    });
    expect(loser).toMatchObject({ doubleFaults: 2, servicePointsWonPct: 68, breakPointsSavedPct: 50 });
  });

  it("writes the score with the winner's games first", () => {
    expect(normalized().score).toBe("6-7 6-3 6-4");
    expect(normalized({ winner_code: "1" }).score).toBe("7-6 3-6 4-6");
  });

  it("follows winner_code when the winner is behind on sets (opponent retired)", () => {
    const match = normalized({
      status_extra: "RETIRED",
      winner_code: "1",
      home_set_score: "0",
      away_set_score: "1",
      home_set_1_score: "4",
      away_set_1_score: "6",
      home_set_2_score: "2",
      away_set_2_score: "0",
      home_set_3_score: "",
      away_set_3_score: "",
    });

    expect(match.status).toBe("RETIRED");
    expect(match.winner.sourceId).toBe("111");
    expect(match.score).toBe("4-6 2-0 RET");
  });
});

describe("normalizeRow: fields", () => {
  it("converts the id, season, date and surface", () => {
    const match = normalized();

    expect(match.sourceMatchId).toBe("75191598");
    expect(match.season).toBe(2024);
    expect(match.playedAt.toISOString()).toBe("2024-01-07T08:00:00.000Z");
    expect(match.surface).toBe("Hard");
    expect(match.status).toBe("COMPLETED");
  });

  it("stores no surface for Davis Cup ties", () => {
    const match = normalized({ tournament: "Davis Cup - World Group ATP", round: "", surface: "no surface" });

    expect(match.surface).toBeNull();
  });

  it("stores missing ranks and statistics as null, not zero", () => {
    const match = normalized({ home_rank: "", home_points: "", home_aces: "", home_service_points_won_perc: "" });

    expect(match.loser).toMatchObject({ rank: null, rankingPoints: null, aces: null, servicePointsWonPct: null });
  });

  it("rejects percentages outside 0–100", () => {
    expect(normalized({ away_service_points_won_perc: "140" }).winner.servicePointsWonPct).toBeNull();
  });

  it("handles a walkover, which has no sets or statistics", () => {
    const match = normalized({
      status_extra: "WALKOVER",
      home_set_score: "",
      away_set_score: "",
      home_set_1_score: "",
      away_set_1_score: "",
      home_set_2_score: "",
      away_set_2_score: "",
      home_set_3_score: "",
      away_set_3_score: "",
      home_aces: "",
      away_aces: "",
    });

    expect(match.status).toBe("WALKOVER");
    expect(match.score).toBe("W/O");
    expect(match.winner.setsWon).toBeNull();
    expect(match.winner.aces).toBeNull();
  });

  it("marks an awarded match", () => {
    expect(normalized({ status_extra: "AWARDED" }).score).toBe("6-7 6-3 6-4 DEF");
  });
});

describe("normalizeRow: best of", () => {
  it("is 3 for ordinary events", () => {
    expect(normalized().bestOf).toBe(3);
  });

  it("is 5 for Grand Slam main draws, even in straight sets", () => {
    expect(normalized({ tournament: "Wimbledon ATP", round: "1/64-finals" }).bestOf).toBe(5);
  });

  it("is 5 for any match where the winner took three sets", () => {
    const match = normalized({ tournament: "Davis Cup - World Group ATP", round: "", surface: "no surface", away_set_score: "3" });

    expect(match.bestOf).toBe(5);
  });
});

describe("normalizeRow: rounds", () => {
  it.each([
    ["Final", "F"],
    ["Semi-finals", "SF"],
    ["Quarter-finals", "QF"],
    ["1/8-finals", "R16"],
    ["1/16-finals", "R32"],
    ["1/32-finals", "R64"],
    ["1/64-finals", "R128"],
    ["3rd place", "BR"],
  ])("maps %s to %s", (raw, code) => {
    expect(normalized({ round: raw }).round).toBe(code);
  });

  it.each([
    ["Finals - Turin ATP (indoor)", "RR"],
    ["Next Gen Finals - Jeddah ATP (indoor)", "RR"],
    ["United Cup ATP", "RR"],
    ["United Cup ATP - Play Offs", "PO"],
    ["Davis Cup - World Group ATP - Qualification", "TIE"],
    ["Laver Cup ATP (indoor)", "TIE"],
  ])("fills in the empty round for %s as %s", (tournament, code) => {
    expect(normalized({ tournament, round: "" }).round).toBe(code);
  });

  it("uses the given round in the knockout stage of the ATP Finals", () => {
    expect(normalized({ tournament: "Finals - Turin ATP - Play Offs (indoor)", round: "Semi-finals" }).round).toBe("SF");
  });
});

describe("normalizeRow: skipped rows", () => {
  it.each([
    [{ tour_type: "3" }, "challenger"],
    [{ tour_type: "5" }, "exhibition"],
    [{ tour_type: "9" }, "invalid-row"],
    [{ tournament: "Brisbane ATP - Qualification", round: "Qualifier" }, "qualifying"],
    [{ tournament: "Wimbledon ATP - Qualification", round: "" }, "qualifying"],
    [{ tournament: "Asian Games ATP (indoor)" }, "excluded-event"],
    [{ tournament: "Hopman Cup ATP", round: "" }, "excluded-event"],
    [{ status_extra: "CANCELED", winner_code: "" }, "cancelled"],
    [{ status: "SCHEDULED", status_extra: "SCHEDULED", winner_code: "" }, "scheduled"],
    [{ status_extra: "ABANDONED" }, "unknown-status"],
    [{ winner_code: "" }, "no-winner"],
    [{ match_id: "" }, "invalid-row"],
    [{ away_id: "" }, "invalid-row"],
    [{ away_id: "111" }, "invalid-row"],
    [{ date_timestamp: "soon" }, "invalid-row"],
    [{ surface: "carpet" }, "invalid-row"],
    [{ tournament: "Antalya Chall. Men" }, "unknown-tournament"],
    [{ tournament: "US Open ATP - WIC" }, "unknown-stage"],
    [{ round: "1/128-finals" }, "unknown-round"],
    [{ round: "Qualifier" }, "unknown-round"], // "Qualifier" outside a qualifying draw
    [{ round: "" }, "unknown-round"], // an ordinary knockout event must have a round
  ])("skips %o as %s", (overrides, reason) => {
    expect(skipReason(overrides)).toBe(reason);
  });

  it("never reads the betting odds", () => {
    const match = normalized();

    expect(JSON.stringify(match)).not.toMatch(/odds/i);
  });
});

describe("parseTournamentName", () => {
  function parse(name: string, season = 2024) {
    const result = parseTournamentName(name, season);
    if (!result.ok) throw new Error(`expected ${name} to parse, got ${result.reason}`);
    return result.tournament;
  }

  it("parses a plain tour event", () => {
    expect(parse("Brisbane ATP")).toEqual({
      slug: "brisbane",
      name: "Brisbane",
      level: "ATP250",
      stage: "MAIN",
      indoor: false,
      detail: null,
    });
  });

  it("gives the qualifying draw the same slug as the main draw", () => {
    const qualifying = parse("Rotterdam ATP - Qualification (indoor)");

    expect(qualifying).toMatchObject({ slug: "rotterdam", stage: "QUALIFYING", indoor: true, level: "ATP500" });
    expect(parse("Rotterdam ATP (indoor)").slug).toBe(qualifying.slug);
  });

  it.each([
    ["Australian Open ATP", "australian-open", "Australian Open", "GS"],
    ["French Open ATP", "roland-garros", "Roland Garros", "GS"],
    ["Wimbledon ATP", "wimbledon", "Wimbledon", "GS"],
    ["US Open ATP", "us-open", "US Open", "GS"],
    ["Monte Carlo ATP", "monte-carlo", "Monte Carlo", "ATPM1000"],
    ["Paris ATP (indoor)", "paris", "Paris", "ATPM1000"],
    ["London ATP", "queens-club", "Queen's Club", "ATP500"],
    ["Hertogenbosch ATP", "s-hertogenbosch", "'s-Hertogenbosch", "ATP250"],
    ["Finals - Turin ATP (indoor)", "atp-finals", "ATP Finals", "Finals"],
    ["Next Gen Finals - Milan ATP (indoor)", "next-gen-atp-finals", "Next Gen ATP Finals", "NextGen"],
    ["Laver Cup ATP (indoor)", "laver-cup", "Laver Cup", "LaverCup"],
    ["ATP Cup ATP", "atp-cup", "ATP Cup", "TeamCup"],
    ["United Cup ATP - Play Offs", "united-cup", "United Cup", "TeamCup"],
    ["Olympic Games ATP", "olympic-games", "Olympic Games", "Olympics"],
    ["St. Petersburg ATP (indoor)", "st-petersburg", "St. Petersburg", "ATP250"],
    ["Melbourne (Summer Set) ATP", "melbourne-summer-set", "Melbourne (Summer Set)", "ATP250"],
    ["Adelaide 2 ATP", "adelaide-2", "Adelaide 2", "ATP250"],
  ])("parses %s", (raw, slug, name, level) => {
    expect(parse(raw)).toMatchObject({ slug, name, level });
  });

  it("merges Montreal and Toronto into one event and keeps the city", () => {
    expect(parse("Montreal ATP")).toMatchObject({ slug: "canadian-open", name: "Canadian Open", level: "ATPM1000", detail: "Montreal" });
    expect(parse("Toronto ATP - Qualification")).toMatchObject({ slug: "canadian-open", stage: "QUALIFYING", detail: "Toronto" });
  });

  it("merges the Next Gen Finals host cities and keeps the city", () => {
    expect(parse("Next Gen Finals - Jeddah ATP - Play Offs (indoor)")).toMatchObject({
      slug: "next-gen-atp-finals",
      stage: "PLAYOFFS",
      detail: "Jeddah",
      indoor: true,
    });
  });

  it("treats Davis Cup groups and rounds as detail, not as qualifying draws", () => {
    expect(parse("Davis Cup - World Group ATP - Qualification")).toMatchObject({
      slug: "davis-cup",
      level: "DavisCup",
      stage: "MAIN",
      detail: "World Group - Qualification",
    });
    expect(parse("Davis Cup - World Group II ATP - Preliminary").detail).toBe("World Group II - Preliminary");
  });

  it("applies level changes by season", () => {
    expect(parse("Doha ATP", 2024).level).toBe("ATP250");
    expect(parse("Doha ATP", 2025).level).toBe("ATP500");
    expect(parse("Dallas ATP (indoor)", 2024).level).toBe("ATP250");
    expect(parse("Munich ATP", 2026).level).toBe("ATP500");
    expect(parse("Astana ATP (indoor)", 2022).level).toBe("ATP500");
    expect(parse("Astana ATP (indoor)", 2023).level).toBe("ATP250");
  });

  it.each([
    ["Antalya Chall. Men", "unknown-tournament"],
    ["Abu Dhabi Exhibition Men", "unknown-tournament"],
    ["", "unknown-tournament"],
    ["US Open ATP - WIC", "unknown-stage"],
    ["Asian Games ATP (indoor)", "excluded-event"],
    ["Hopman Cup ATP", "excluded-event"],
  ])("rejects %s", (raw, reason) => {
    expect(parseTournamentName(raw, 2024)).toMatchObject({ ok: false, reason });
  });
});

describe("slugify", () => {
  it("makes lowercase, hyphenated, accent-free slugs", () => {
    expect(slugify("Rio de Janeiro")).toBe("rio-de-janeiro");
    expect(slugify("St. Petersburg")).toBe("st-petersburg");
    expect(slugify("Båstad")).toBe("bastad");
    expect(slugify("Melbourne (Great Ocean Road Open)")).toBe("melbourne-great-ocean-road-open");
  });
});
