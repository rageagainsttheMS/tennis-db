export const ROUTES = {
    PLAYERADMIN : "/admin/players",
    PLAYERCREATE: "/admin/players/create",
    SIGNIN : "/signIn",
    TOURNADMIN : "/admin/tournaments",
    PLAYERPROFILE: "/profile",
    TOURNEYCREATE: "/admin/tournaments/create",
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

export const ROUND_TYPES = [
    { label: "Final", value: "F" },
    { label: "Semi-Final", value: "SF" },
    { label: "Quarter-Final", value: "QF" },
    { label: "Round of 16", value: "R16" },
    { label: "3rd Round", value: "R32" },
    { label: "2nd Round", value: "R64" },
    { label: "1st Round", value: "R128" },
    { label: "Round Robin", value: "RR" },
]

export const TOURNAMENT_TYPES = [
    { label: "Grand Slam", value: "GS" },
    { label: "ATP Masters 1000", value: "ATPM1000" },
    { label: "ATP 500", value: "ATP500" },
    { label: "ATP 250", value: "ATP250" },
    { label: "Davis Cup", value: "DavisCup" },
    { label: "Laver Cup", value: "LaverCup" },
];