import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, requireAdminMock } = vi.hoisted(() => ({
  prismaMock: {
    player: { update: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
    tournament: { update: vi.fn(), findUnique: vi.fn() },
    match: { findMany: vi.fn(), findUnique: vi.fn() },
  },
  requireAdminMock: vi.fn(),
}));

vi.mock("@/db/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/utils/auth-guards", () => ({ requireAdmin: requireAdminMock }));

import { getPlayerById, getPlayerMatches, getPlayers, updatePlayer } from "@/lib/actions/player.actions";
import { getTournamentById, getTournamentSeasons, updateTournament } from "@/lib/actions/tournament.actions";
import { getMatchById } from "@/lib/actions/match.actions";
import { makeBioInput } from "../helpers/fixtures";

const DENIED = { success: false, message: "You are not authorised to do that." };
const GENERIC_ERROR = "Something went wrong. Please try again.";

function writeMocks() {
  return [prismaMock.player.update, prismaMock.tournament.update];
}

beforeEach(() => {
  for (const model of Object.values(prismaMock)) for (const fn of Object.values(model)) fn.mockReset();
  requireAdminMock.mockReset();
  requireAdminMock.mockResolvedValue(null); // admin by default; tests opt into a denial
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("authorization", () => {
  it.each([
    ["updatePlayer", () => updatePlayer("player-1", makeBioInput())],
    ["updateTournament", () => updateTournament("brisbane", { description: "x" })],
  ])("%s rejects non-admins before touching the database", async (_name, call) => {
    requireAdminMock.mockResolvedValue(DENIED);

    await expect(call()).resolves.toEqual(DENIED);
    for (const fn of writeMocks()) expect(fn).not.toHaveBeenCalled();
  });
});

describe("updatePlayer", () => {
  it("saves only the validated bio fields", async () => {
    prismaMock.player.update.mockResolvedValue({ id: "p1", name: "Dimitrov G.", fullName: "Grigor Dimitrov" });

    // Extra keys a malicious client might send. The type forbids them, the schema strips them.
    const result = await updatePlayer("p1", { ...makeBioInput(), sourceId: "hijack", name: "Renamed P." } as never);

    expect(result).toEqual({ success: true, message: "Player Grigor Dimitrov updated successfully", id: "p1" });
    const { where, data } = prismaMock.player.update.mock.calls[0][0];
    expect(where).toEqual({ id: "p1" });
    expect(data).toMatchObject({ fullName: "Grigor Dimitrov", hand: "RIGHT" });
    expect(data).not.toHaveProperty("sourceId");
    expect(data).not.toHaveProperty("name");
  });

  it("falls back to the source name in the message when there's no full name", async () => {
    prismaMock.player.update.mockResolvedValue({ id: "p1", name: "Rune H.", fullName: null });

    await expect(updatePlayer("p1", makeBioInput({ fullName: "" }))).resolves.toMatchObject({
      message: "Player Rune H. updated successfully",
    });
  });

  it("rejects a missing id", async () => {
    await expect(updatePlayer("", makeBioInput())).resolves.toEqual({ success: false, message: "Invalid player id." });
    expect(prismaMock.player.update).not.toHaveBeenCalled();
  });

  it("returns the validation error without writing", async () => {
    await expect(updatePlayer("p1", makeBioInput({ hand: "BOTH" }))).resolves.toEqual({ success: false, message: "Invalid hand." });
    expect(prismaMock.player.update).not.toHaveBeenCalled();
  });

  it("hides database errors from the client", async () => {
    prismaMock.player.update.mockRejectedValue(new Error("Record to update not found."));

    await expect(updatePlayer("missing", makeBioInput())).resolves.toEqual({ success: false, message: GENERIC_ERROR });
  });
});

describe("updateTournament", () => {
  it("saves the admin details only", async () => {
    prismaMock.tournament.update.mockResolvedValue({ id: "brisbane", name: "Brisbane" });

    const result = await updateTournament("brisbane", { description: "Season opener.", drawSize: "32", name: "Renamed", tournamentType: "GS" } as never);

    expect(result).toEqual({ success: true, message: "Tournament Brisbane updated successfully", id: "brisbane" });
    expect(prismaMock.tournament.update).toHaveBeenCalledWith({
      where: { id: "brisbane" },
      data: { description: "Season opener.", drawSize: 32, image: null },
    });
  });

  it("returns the validation error without writing", async () => {
    await expect(updateTournament("brisbane", { drawSize: 1 })).resolves.toEqual({
      success: false,
      message: "Draw size must be between 2 and 256.",
    });
    expect(prismaMock.tournament.update).not.toHaveBeenCalled();
  });

  it("hides database errors from the client", async () => {
    prismaMock.tournament.update.mockRejectedValue(new Error("Record to update not found."));

    await expect(updateTournament("missing", {})).resolves.toEqual({ success: false, message: GENERIC_ERROR });
  });
});

describe("read actions", () => {
  it("searches both the source name and the full name, with a limit", async () => {
    prismaMock.player.findMany.mockResolvedValue([]);

    await getPlayers("  alcaraz ");

    const args = prismaMock.player.findMany.mock.calls[0][0];
    expect(args.where).toEqual({
      OR: [
        { name: { contains: "alcaraz", mode: "insensitive" } },
        { fullName: { contains: "alcaraz", mode: "insensitive" } },
      ],
    });
    expect(args.take).toBe(20);
  });

  it("lists every player when there's no search", async () => {
    prismaMock.player.findMany.mockResolvedValue([]);

    await getPlayers();

    expect(prismaMock.player.findMany.mock.calls[0][0]).toMatchObject({ where: undefined, take: undefined });
  });

  it("loads a player's wins and losses, newest first", async () => {
    prismaMock.match.findMany.mockResolvedValue([]);

    await getPlayerMatches("p1");

    expect(prismaMock.match.findMany.mock.calls[0][0]).toMatchObject({
      where: { OR: [{ winnerId: "p1" }, { loserId: "p1" }] },
      orderBy: { playedAt: "desc" },
    });
  });

  it("doesn't query for an empty or invalid id", async () => {
    await expect(getPlayerById("")).resolves.toBeNull();
    await expect(getTournamentById("")).resolves.toBeNull();
    await expect(getPlayerMatches("")).resolves.toEqual([]);
    await expect(getMatchById(Number.NaN)).resolves.toBeNull();
    expect(prismaMock.player.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.tournament.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.match.findMany).not.toHaveBeenCalled();
    expect(prismaMock.match.findUnique).not.toHaveBeenCalled();
  });

  it("lists a tournament's seasons, newest first", async () => {
    prismaMock.match.findMany.mockResolvedValue([{ season: 2026 }, { season: 2025 }]);

    await expect(getTournamentSeasons("brisbane")).resolves.toEqual([2026, 2025]);
    expect(prismaMock.match.findMany.mock.calls[0][0]).toMatchObject({ distinct: ["season"], orderBy: { season: "desc" } });
  });
});
