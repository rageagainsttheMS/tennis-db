import { describe, expect, it } from "vitest";
import { parseInput } from "@/lib/validation";
import { playerInputSchema } from "@/lib/validation/player.schema";
import { tournamentInputSchema } from "@/lib/validation/tournament.schema";
import { makePlayerInput, makeTournamentInput } from "../helpers/fixtures";

describe("playerInputSchema", () => {
  it("accepts a valid player and trims text", () => {
    const result = parseInput(playerInputSchema, makePlayerInput({ name: "  Grigor Dimitrov  " }));

    expect(result).toEqual({ data: expect.objectContaining({ name: "Grigor Dimitrov", rank: 14 }) });
  });

  it("strips fields the client must not set", () => {
    const input = { ...makePlayerInput(), id: "attacker-id", playerMatchId: "someone-else" };
    const result = parseInput(playerInputSchema, input);

    expect("data" in result && result.data).not.toHaveProperty("id");
    expect("data" in result && result.data).not.toHaveProperty("playerMatchId");
  });

  it("coerces a numeric string rank, as the admin form sends it", () => {
    const result = parseInput(playerInputSchema, { ...makePlayerInput(), rank: "7" });

    expect("data" in result && result.data.rank).toBe(7);
  });

  it("stores an empty nickname as null", () => {
    const result = parseInput(playerInputSchema, makePlayerInput({ nickName: "" }));

    expect("data" in result && result.data.nickName).toBeNull();
  });

  it.each([
    [{ name: "" }, "Name is required."],
    [{ name: "   " }, "Name is required."],
    [{ hand: "AMBIDEXTROUS" }, "Invalid hand."],
    [{ backHand: "THREEHANDED" }, "Invalid backhand."],
    [{ rank: 1.5 }, "Rank must be a whole number."],
    [{ rank: "abc" }, "Rank must be a whole number."],
  ])("rejects %o with %s", (override, message) => {
    const result = parseInput(playerInputSchema, { ...makePlayerInput(), ...override });

    expect(result).toEqual({ error: message });
  });

  it("rejects non-object input", () => {
    expect(parseInput(playerInputSchema, null)).toHaveProperty("error");
    expect(parseInput(playerInputSchema, "player")).toHaveProperty("error");
  });
});

describe("tournamentInputSchema", () => {
  it("accepts a valid tournament and drops the client-supplied id", () => {
    const result = parseInput(tournamentInputSchema, makeTournamentInput());

    expect("data" in result && result.data).toMatchObject({ name: "Brisbane", drawSize: 32 });
    expect("data" in result && result.data).not.toHaveProperty("id");
  });

  it.each([
    [{ tournamentType: "ITF" }, "Invalid tournament type."],
    [{ drawSize: 1 }, "Draw size must be between 2 and 256."],
    [{ drawSize: 512 }, "Draw size must be between 2 and 256."],
    [{ name: "" }, "Name is required."],
  ])("rejects %o with %s", (override, message) => {
    const result = parseInput(tournamentInputSchema, { ...makeTournamentInput(), ...override });

    expect(result).toEqual({ error: message });
  });

  it("stores a missing description as null", () => {
    const result = parseInput(tournamentInputSchema, makeTournamentInput({ description: null }));

    expect("data" in result && result.data.description).toBeNull();
  });
});
