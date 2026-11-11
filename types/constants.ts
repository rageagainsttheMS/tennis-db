export const ROUTES = {
    PLAYERADMIN : "/admin/players",
    SIGNIN : "/signIn",
    TOURNADMIN : "/admin/tournaments",
    PLAYERPROFILE: "/profile",
}

export const HIGHLIGHT_BORDER = 'blackAlpha.500';
export const HIGHLIGHT_BORDER_WIDTH = '2px';

export const ADMINROLE = 'admin';

export const PLAYER_HAND = [
    {ID : "LEFT", TEXT : "Left Handed"},
    {ID : "RIGHT", TEXT : "Right Handed"},
]

export const PLAYER_BACKHAND = [
    {ID : "ONEHANDED", TEXT : "One Handed"},
    {ID : "TWOHANDED", TEXT : "Two Handed"},
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
