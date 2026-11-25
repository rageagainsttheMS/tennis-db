export const ROUTES = {
    PLAYERS: "/players",
    TOURNAMENTS: "/tournaments",
    /** Old admin list URLs. They redirect to the public lists, which show admins the bio columns. */
    PLAYERADMIN : "/admin/players",
    TOURNADMIN : "/admin/tournaments",
    SIGNIN : "/signIn",
    PLAYERPROFILE: "/profile",
    TOURNAMENT: "/tournament",
    MATCH: "/match",
}

/** Current players offered as search suggestions on the home page. */
export const SUGGESTED_PLAYERS = ["Jannik Sinner", "Carlos Alcaraz", "Novak Djokovic", "Alexander Zverev"] as const;

/** The four majors, by their tournament slug, in calendar order. */
export const GRAND_SLAMS = [
    { id: "australian-open", name: "Australian Open", surface: "Hard" },
    { id: "roland-garros", name: "Roland Garros", surface: "Clay" },
    { id: "wimbledon", name: "Wimbledon", surface: "Grass" },
    { id: "us-open", name: "US Open", surface: "Hard" },
] as const;

export const ADMINROLE = 'admin';

export const PLAYER_HAND = [
    {ID : "LEFT", TEXT : "Left-handed"},
    {ID : "RIGHT", TEXT : "Right-handed"},
]

export const PLAYER_BACKHAND = [
    {ID : "ONEHANDED", TEXT : "One-handed"},
    {ID : "TWOHANDED", TEXT : "Two-handed"},
]

/** Every round, in the order a tournament page lists them (final first). */
export const ROUND_TYPES = [
    { label: "Final", value: "F" },
    { label: "Bronze Medal Match", value: "BR" },
    { label: "Semi-Final", value: "SF" },
    { label: "Quarter-Final", value: "QF" },
    { label: "Round of 16", value: "R16" },
    { label: "Round of 32", value: "R32" },
    { label: "Round of 64", value: "R64" },
    { label: "Round of 128", value: "R128" },
    { label: "Knockout Stage", value: "PO" },
    { label: "Round Robin", value: "RR" },
    { label: "Tie", value: "TIE" },
] as const;

export function roundLabel(round: string): string {
    return ROUND_TYPES.find((type) => type.value === round)?.label ?? round;
}

export const TOURNAMENT_TYPES = [
    { label: "Grand Slam", value: "GS" },
    { label: "ATP Masters 1000", value: "ATPM1000" },
    { label: "ATP Finals", value: "Finals" },
    { label: "ATP 500", value: "ATP500" },
    { label: "ATP 250", value: "ATP250" },
    { label: "Next Gen ATP Finals", value: "NextGen" },
    { label: "Olympic Games", value: "Olympics" },
    { label: "Davis Cup", value: "DavisCup" },
    { label: "Laver Cup", value: "LaverCup" },
    { label: "Team Cup", value: "TeamCup" },
] as const;

export function tournamentTypeLabel(type: string): string {
    return TOURNAMENT_TYPES.find((entry) => entry.value === type)?.label ?? type;
}

export const MATCH_STATUS_LABELS: Record<string, string> = {
    COMPLETED: "",
    RETIRED: "Retired",
    WALKOVER: "Walkover",
    AWARDED: "Awarded",
};
