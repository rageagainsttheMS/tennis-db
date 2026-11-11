/**
 * Parses tournament names from the tennisdata.app season files.
 *
 * The source has no tournament ID. One name carries the event, the tour, the stage and the
 * venue type, e.g. "Rotterdam ATP - Qualification (indoor)". This module splits that into a
 * stable slug, a display name, a level, a stage and an indoor flag.
 */

/** Matches the `TournamentType` enum in prisma/schema.prisma. */
export type TournamentLevel =
  | "GS"
  | "ATPM1000"
  | "ATP500"
  | "ATP250"
  | "Finals"
  | "NextGen"
  | "DavisCup"
  | "LaverCup"
  | "TeamCup"
  | "Olympics";

export type TournamentStage = "MAIN" | "QUALIFYING" | "PLAYOFFS";

export interface ParsedTournament {
  /** Stable ID for the event across seasons, e.g. "roland-garros". */
  slug: string;
  /** Display name, e.g. "Roland Garros". */
  name: string;
  /** Level in the given season. A few events changed level between seasons. */
  level: TournamentLevel;
  stage: TournamentStage;
  indoor: boolean;
  /** Extra detail the source puts in the name, e.g. the Davis Cup group or the host city. */
  detail: string | null;
}

export type TournamentParseResult =
  | { ok: true; tournament: ParsedTournament }
  | { ok: false; reason: "unknown-tournament" | "unknown-stage" | "excluded-event"; detail: string };

const GRAND_SLAMS = new Set(["australian-open", "roland-garros", "wimbledon", "us-open"]);

const MASTERS_1000 = new Set([
  "indian-wells",
  "miami",
  "monte-carlo",
  "madrid",
  "rome",
  "canadian-open",
  "cincinnati",
  "shanghai",
  "paris",
]);

/** ATP 500 events in every season from 2021 to 2026. */
const ATP_500_ALWAYS = new Set([
  "rotterdam",
  "rio-de-janeiro",
  "acapulco",
  "dubai",
  "barcelona",
  "halle",
  "queens-club",
  "hamburg",
  "washington",
  "beijing",
  "tokyo",
  "vienna",
  "basel",
]);

/** Events that were ATP 500s only in some seasons. */
const ATP_500_BY_SEASON: Record<string, (season: number) => boolean> = {
  dallas: (season) => season >= 2025,
  doha: (season) => season >= 2025,
  munich: (season) => season >= 2025,
  astana: (season) => season === 2022,
};

const TEAM_EVENTS = new Set(["united-cup", "atp-cup"]);

/** Events the source labels "ATP Tour" that aren't ATP events. They're not imported. */
const EXCLUDED_EVENTS = new Set(["asian-games", "hopman-cup"]);

/** Events whose source name differs from the name people know them by. */
const ALIASES: Record<string, { slug: string; name: string }> = {
  "French Open": { slug: "roland-garros", name: "Roland Garros" },
  London: { slug: "queens-club", name: "Queen's Club" },
  Hertogenbosch: { slug: "s-hertogenbosch", name: "'s-Hertogenbosch" },
  // One event that alternates between the two cities each year.
  Montreal: { slug: "canadian-open", name: "Canadian Open" },
  Toronto: { slug: "canadian-open", name: "Canadian Open" },
};

const STAGES: Record<string, TournamentStage> = {
  Qualification: "QUALIFYING",
  "Play Offs": "PLAYOFFS",
};

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function levelFor(slug: string, season: number): TournamentLevel {
  if (GRAND_SLAMS.has(slug)) return "GS";
  if (MASTERS_1000.has(slug)) return "ATPM1000";
  if (ATP_500_ALWAYS.has(slug) || ATP_500_BY_SEASON[slug]?.(season)) return "ATP500";
  if (slug === "atp-finals") return "Finals";
  if (slug === "next-gen-atp-finals") return "NextGen";
  if (slug === "davis-cup") return "DavisCup";
  if (slug === "laver-cup") return "LaverCup";
  if (TEAM_EVENTS.has(slug)) return "TeamCup";
  if (slug === "olympic-games") return "Olympics";
  return "ATP250";
}

/**
 * Parses a tour-level name such as "Finals - Turin ATP - Play Offs (indoor)".
 * Challenger and exhibition names have a different shape and are rejected.
 */
export function parseTournamentName(rawName: string, season: number): TournamentParseResult {
  let rest = rawName.trim();

  const indoor = / \(indoor\)$/.test(rest);
  if (indoor) rest = rest.replace(/ \(indoor\)$/, "");

  // "<event> ATP" or "<event> ATP - <stage>". The greedy match keeps "ATP Cup" intact in "ATP Cup ATP".
  const match = /^(.+) ATP(?: - (.+))?$/.exec(rest);
  if (!match) return { ok: false, reason: "unknown-tournament", detail: rawName };
  const [, event, stageText] = match;

  // Davis Cup: the text around "ATP" names the group and the round of ties, not a qualifying draw.
  if (event === "Davis Cup" || event.startsWith("Davis Cup - ")) {
    const group = event === "Davis Cup" ? null : event.slice("Davis Cup - ".length);
    const detail = [group, stageText].filter(Boolean).join(" - ") || null;
    return {
      ok: true,
      tournament: { slug: "davis-cup", name: "Davis Cup", level: "DavisCup", stage: "MAIN", indoor, detail },
    };
  }

  let stage: TournamentStage = "MAIN";
  if (stageText !== undefined) {
    const known = STAGES[stageText];
    if (!known) return { ok: false, reason: "unknown-stage", detail: rawName };
    stage = known;
  }

  let slug: string;
  let name: string;
  let detail: string | null = null;

  if (event.startsWith("Next Gen Finals - ")) {
    slug = "next-gen-atp-finals";
    name = "Next Gen ATP Finals";
    detail = event.slice("Next Gen Finals - ".length);
  } else if (event.startsWith("Finals - ")) {
    slug = "atp-finals";
    name = "ATP Finals";
    detail = event.slice("Finals - ".length);
  } else if (ALIASES[event]) {
    ({ slug, name } = ALIASES[event]);
    if (slug === "canadian-open") detail = event;
  } else {
    slug = slugify(event);
    name = event;
  }

  if (!slug) return { ok: false, reason: "unknown-tournament", detail: rawName };
  if (EXCLUDED_EVENTS.has(slug)) return { ok: false, reason: "excluded-event", detail: name };

  return { ok: true, tournament: { slug, name, level: levelFor(slug, season), stage, indoor, detail } };
}
