import { describe, expect, it } from "vitest";
import {
  formatDateRange,
  hasPlayerBio,
  hasTournamentDetails,
  initials,
  letterFor,
  parseScore,
  splitNicknames,
  surfaceKey,
  surfaceLabel,
} from "@/lib/utils/display";
import { makePlayer, makeTournament } from "../helpers/fixtures";

describe("initials", () => {
  it.each([
    ["Carlos Alcaraz", "CA"],
    ["Alcaraz C.", "AC"],
    ["Aguilar Cardozo J.", "AJ"],
    ["Agbo-Panzo P.", "AP"],
    ["Djokovic", "D"],
    ["", "?"],
  ])("%s → %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe("splitNicknames", () => {
  it("splits on commas and drops blanks", () => {
    expect(splitNicknames(" Carlitos, VAMOS ,, Son of Rafa ")).toEqual(["Carlitos", "VAMOS", "Son of Rafa"]);
    expect(splitNicknames(null)).toEqual([]);
    expect(splitNicknames("")).toEqual([]);
  });
});

describe("surfaces", () => {
  it("normalises the surface and adds indoor", () => {
    expect(surfaceKey("Hard")).toBe("hard");
    expect(surfaceKey("carpet")).toBeNull();
    expect(surfaceKey(null)).toBeNull();
    expect(surfaceLabel("Hard", true)).toBe("Hard (indoor)");
    expect(surfaceLabel("clay")).toBe("Clay");
    expect(surfaceLabel(null, true)).toBeNull();
  });
});

describe("parseScore", () => {
  it("splits sets, winner first", () => {
    expect(parseScore("7-6 3-6 6-4")).toEqual({
      sets: [
        { winner: 7, loser: 6 },
        { winner: 3, loser: 6 },
        { winner: 6, loser: 4 },
      ],
      note: null,
    });
  });

  it("keeps retirements and walkovers as a note", () => {
    expect(parseScore("6-3 2-0 RET")).toEqual({ sets: [{ winner: 6, loser: 3 }, { winner: 2, loser: 0 }], note: "RET" });
    expect(parseScore("W/O")).toEqual({ sets: [], note: "W/O" });
  });
});

describe("letterFor", () => {
  it("buckets by first letter, ignoring accents and leading punctuation", () => {
    expect(letterFor("Alcaraz C.")).toBe("A");
    expect(letterFor("Ćorić B.")).toBe("C");
    expect(letterFor("'s-Hertogenbosch")).toBe("S");
    expect(letterFor("123")).toBe("#");
  });
});

describe("hasPlayerBio / hasTournamentDetails", () => {
  const empty = {
    fullName: null,
    nickName: null,
    hand: null,
    backHand: null,
    country: null,
    birthPlace: null,
    birthDate: null,
    turnedPro: null,
    profile: null,
    image: null,
  };

  it("is true when any bio field is entered", () => {
    expect(hasPlayerBio(makePlayer({ ...empty }))).toBe(false);
    expect(hasPlayerBio(makePlayer({ ...empty, birthDate: new Date("2003-05-05") }))).toBe(true);
    expect(hasPlayerBio(makePlayer())).toBe(true);
  });

  it("is true when a tournament has a description or image", () => {
    expect(hasTournamentDetails(makeTournament({ description: null, image: null }))).toBe(false);
    expect(hasTournamentDetails(makeTournament({ description: null, image: "tournaments/x.jpg" }))).toBe(true);
  });
});

describe("formatDateRange", () => {
  it.each([
    ["2026-11-04", "2026-11-08", "4–8 Nov 2026"],
    ["2026-10-27", "2026-11-01", "27 Oct – 1 Nov 2026"],
    ["2025-12-29", "2026-01-03", "29 Dec 2025 – 3 Jan 2026"],
    ["2026-10-06T10:00:00Z", "2026-10-06T18:00:00Z", "6 Oct 2026"],
  ])("%s to %s → %s", (start, end, expected) => {
    expect(formatDateRange(new Date(start), new Date(end))).toBe(expected);
  });
});
