import { describe, expect, it } from "vitest";
import { parseInput } from "@/lib/validation";
import { playerBioSchema } from "@/lib/validation/player.schema";
import { tournamentInfoSchema } from "@/lib/validation/tournament.schema";
import { makeBioInput } from "../helpers/fixtures";

describe("playerBioSchema", () => {
  it("accepts a full bio and trims text", () => {
    const result = parseInput(playerBioSchema, makeBioInput({ fullName: "  Grigor Dimitrov  " }));

    expect(result).toEqual({ data: expect.objectContaining({ fullName: "Grigor Dimitrov", hand: "RIGHT", backHand: "ONEHANDED" }) });
  });

  it("strips the fields the seed loader owns", () => {
    const input = { ...makeBioInput(), id: "attacker-id", sourceId: "someone-else", name: "Renamed P." };
    const result = parseInput(playerBioSchema, input);

    expect("data" in result && result.data).not.toHaveProperty("id");
    expect("data" in result && result.data).not.toHaveProperty("sourceId");
    expect("data" in result && result.data).not.toHaveProperty("name");
  });

  it("stores empty and missing fields as null", () => {
    const result = parseInput(playerBioSchema, { fullName: "", hand: "", country: "   " });

    expect(result).toEqual({
      data: {
        fullName: null,
        nickName: null,
        hand: null,
        backHand: null,
        country: null,
        birthPlace: null,
        turnedPro: null,
        birthDate: null,
        profile: null,
        image: null,
      },
    });
  });

  it.each([
    [{ hand: "AMBIDEXTROUS" }, "Invalid hand."],
    [{ backHand: "THREEHANDED" }, "Invalid backhand."],
  ])("rejects %o with %s", (override, message) => {
    expect(parseInput(playerBioSchema, makeBioInput(override))).toEqual({ error: message });
  });

  it("parses a birth date to midnight UTC", () => {
    const result = parseInput(playerBioSchema, makeBioInput({ birthDate: "2003-05-05" }));

    expect(result).toEqual({ data: expect.objectContaining({ birthDate: new Date("2003-05-05T00:00:00Z") }) });
  });

  it.each([
    ["05/05/2003", "Birth date must be a date."],
    ["2003-02-30", "Birth date must be a date."],
    [20030505, "Birth date must be a date."],
    ["1899-12-31", "Birth date must be after 1900 and not in the future."],
    ["2999-01-01", "Birth date must be after 1900 and not in the future."],
  ])("rejects the birth date %o", (birthDate, message) => {
    expect(parseInput(playerBioSchema, makeBioInput({ birthDate }))).toEqual({ error: message });
  });

  it("rejects over-long text and non-object input", () => {
    expect(parseInput(playerBioSchema, makeBioInput({ fullName: "x".repeat(121) }))).toHaveProperty("error");
    expect(parseInput(playerBioSchema, null)).toHaveProperty("error");
    expect(parseInput(playerBioSchema, "player")).toHaveProperty("error");
  });
});

describe("tournamentInfoSchema", () => {
  it("accepts details and drops fields the loader owns", () => {
    const result = parseInput(tournamentInfoSchema, {
      description: "Season opener.",
      drawSize: "32",
      image: "",
      id: "client-chosen",
      name: "Renamed Open",
      tournamentType: "GS",
    });

    expect(result).toEqual({ data: { description: "Season opener.", drawSize: 32, image: null } });
  });

  it("treats an empty or zero draw size as not entered", () => {
    expect(parseInput(tournamentInfoSchema, { drawSize: "" })).toEqual({ data: { description: null, image: null, drawSize: null } });
    expect(parseInput(tournamentInfoSchema, { drawSize: 0 })).toEqual({ data: { description: null, image: null, drawSize: null } });
  });

  it.each([
    [{ drawSize: 1 }, "Draw size must be between 2 and 256."],
    [{ drawSize: 512 }, "Draw size must be between 2 and 256."],
    [{ drawSize: 1.5 }, "Draw size must be a whole number."],
    [{ drawSize: "abc" }, "Draw size must be a number."],
  ])("rejects %o with %s", (input, message) => {
    expect(parseInput(tournamentInfoSchema, input)).toEqual({ error: message });
  });
});
