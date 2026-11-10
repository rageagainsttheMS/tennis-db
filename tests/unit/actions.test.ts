import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, requireAdminMock } = vi.hoisted(() => ({
  prismaMock: {
    match: { findFirst: vi.fn() },
    player: { create: vi.fn(), update: vi.fn() },
    tournament: { create: vi.fn() },
  },
  requireAdminMock: vi.fn(),
}));

vi.mock("@/db/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/utils/auth-guards", () => ({ requireAdmin: requireAdminMock }));

import { createPlayer, updatePlayer } from "@/lib/actions/player.actions";
import { createTournament } from "@/lib/actions/tournament.actions";
import { makePlayerInput, makeTournamentInput } from "../helpers/fixtures";

const DENIED = { success: false, message: "You are not authorised to do that." };
const GENERIC_ERROR = "Something went wrong. Please try again.";

function allDbMocks() {
  return [prismaMock.match.findFirst, prismaMock.player.create, prismaMock.player.update, prismaMock.tournament.create];
}

beforeEach(() => {
  for (const fn of [...allDbMocks(), requireAdminMock]) fn.mockReset();
  requireAdminMock.mockResolvedValue(null); // admin by default; tests opt into a denial
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("authorization", () => {
  it.each([
    ["createPlayer", () => createPlayer(makePlayerInput())],
    ["updatePlayer", () => updatePlayer("player-1", makePlayerInput())],
    ["createTournament", () => createTournament(makeTournamentInput())],
  ])("%s rejects non-admins before touching the database", async (_name, call) => {
    requireAdminMock.mockResolvedValue(DENIED);

    await expect(call()).resolves.toEqual(DENIED);
    for (const fn of allDbMocks()) expect(fn).not.toHaveBeenCalled();
  });
});

describe("createPlayer", () => {
  it("links the player to the dataset through a match they won", async () => {
    prismaMock.match.findFirst.mockResolvedValue({ winnerId: "105777" });
    prismaMock.player.create.mockResolvedValue({ id: "p1", name: "Grigor Dimitrov" });

    const result = await createPlayer(makePlayerInput());

    expect(result).toEqual({ success: true, message: "Player Grigor Dimitrov created successfully", id: "p1" });
    expect(prismaMock.match.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { winnerName: "Grigor Dimitrov" } })
    );
    expect(prismaMock.player.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: "Grigor Dimitrov", playerMatchId: "105777" }),
    });
  });

  it("ignores a client-supplied playerMatchId", async () => {
    prismaMock.match.findFirst.mockResolvedValue({ winnerId: "105777" });
    prismaMock.player.create.mockResolvedValue({ id: "p1", name: "Grigor Dimitrov" });

    await createPlayer(makePlayerInput({ playerMatchId: "someone-elses-id" }));

    expect(prismaMock.player.create.mock.calls[0][0].data.playerMatchId).toBe("105777");
  });

  it("refuses a player with no matches in the dataset", async () => {
    prismaMock.match.findFirst.mockResolvedValue(null);

    const result = await createPlayer(makePlayerInput({ name: "Unknown Player" }));

    expect(result).toEqual({ success: false, message: "No matches found for player Unknown Player" });
    expect(prismaMock.player.create).not.toHaveBeenCalled();
  });

  it("returns the validation error without querying", async () => {
    const result = await createPlayer(makePlayerInput({ name: "" }));

    expect(result).toEqual({ success: false, message: "Name is required." });
    expect(prismaMock.match.findFirst).not.toHaveBeenCalled();
  });

  it("hides database errors from the client", async () => {
    prismaMock.match.findFirst.mockRejectedValue(new Error('relation "Player" violates unique constraint'));

    const result = await createPlayer(makePlayerInput());

    expect(result).toEqual({ success: false, message: GENERIC_ERROR });
  });
});

describe("updatePlayer", () => {
  it("updates only the validated fields", async () => {
    prismaMock.player.update.mockResolvedValue({ id: "p1", name: "Grigor Dimitrov" });

    const result = await updatePlayer("p1", { ...makePlayerInput(), playerMatchId: "hijack" });

    expect(result).toMatchObject({ success: true, id: "p1" });
    const { where, data } = prismaMock.player.update.mock.calls[0][0];
    expect(where).toEqual({ id: "p1" });
    expect(data).not.toHaveProperty("playerMatchId");
  });

  it("rejects a missing id", async () => {
    const result = await updatePlayer("", makePlayerInput());

    expect(result).toEqual({ success: false, message: "Invalid player id." });
    expect(prismaMock.player.update).not.toHaveBeenCalled();
  });

  it("hides database errors from the client", async () => {
    prismaMock.player.update.mockRejectedValue(new Error("Record to update not found."));

    await expect(updatePlayer("missing", makePlayerInput())).resolves.toEqual({
      success: false,
      message: GENERIC_ERROR,
    });
  });
});

describe("createTournament", () => {
  it("takes the id from the matches table, not the client", async () => {
    prismaMock.match.findFirst.mockResolvedValue({ tourneyId: "2024-339" });
    prismaMock.tournament.create.mockResolvedValue({ id: "2024-339", name: "Brisbane" });

    const result = await createTournament(makeTournamentInput({ id: "client-chosen" }));

    expect(result).toEqual({ success: true, message: "Tournament Brisbane created successfully", id: "2024-339" });
    expect(prismaMock.tournament.create.mock.calls[0][0].data.id).toBe("2024-339");
  });

  it("refuses a tournament that isn't in the dataset", async () => {
    prismaMock.match.findFirst.mockResolvedValue(null);

    const result = await createTournament(makeTournamentInput({ name: "Made-up Open" }));

    expect(result).toEqual({ success: false, message: "Tournament not found in matches table" });
    expect(prismaMock.tournament.create).not.toHaveBeenCalled();
  });

  it("returns the validation error without querying", async () => {
    const result = await createTournament(makeTournamentInput({ drawSize: 1 }));

    expect(result).toEqual({ success: false, message: "Draw size must be between 2 and 256." });
    expect(prismaMock.match.findFirst).not.toHaveBeenCalled();
  });
});
