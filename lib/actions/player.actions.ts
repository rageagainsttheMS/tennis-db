"use server";
import { prisma } from "@/db/prisma";
import { ActionResult, Player } from "@/types";
import { parseInput } from "@/lib/validation";
import { playerInputSchema } from "@/lib/validation/player.schema";
import { requireAdmin } from "@/lib/utils/auth-guards";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function createPlayer(oPayload: Player): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = parseInput(playerInputSchema, oPayload);
  if ("error" in parsed) return { success: false, message: parsed.error };

  try {
    // Link the player to the dataset by finding a match they won.
    const match = await prisma.match.findFirst({
      where: { winnerName: parsed.data.name },
      select: { winnerId: true },
    });

    if (!match?.winnerId) {
      return {
        message: `No matches found for player ${parsed.data.name}`,
        success: false,
      };
    }

    const newPlayer = await prisma.player.create({
      data: { ...parsed.data, playerMatchId: match.winnerId },
    });
    return {
      message: `Player ${newPlayer.name} created successfully`,
      success: true,
      id: newPlayer.id,
    };
  } catch (error) {
    console.error("createPlayer failed", error);
    return { message: GENERIC_ERROR, success: false };
  }
}

// Get all matches for a player by playerMatchId (matches where player is winner or loser)
export async function getPlayerMatches(playerMatchId: string) {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { winnerId: playerMatchId },
          { loserId: playerMatchId },
        ],
      },
    });
    return matches;
}

export async function getPlayers(searchQuery?: string) {
    const players = await prisma.player.findMany({
        where: searchQuery ? {
            name: {
                contains: searchQuery,
                mode: 'insensitive'
            }
        } : undefined,
        orderBy: {
            name: 'asc'
        }
    });
    return players;
}

export async function getPlayerById(id: string) {
  const player = await prisma.player.findUnique({
    where: { id },
  });
  return player;
}

export async function getPlayerByMatchId(playerMatchId: string) {
  const player = await prisma.player.findFirst({
    where: { playerMatchId },
  });
  return player;
}

export async function updatePlayer(id: string, oPayload: Player): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (typeof id !== "string" || !id) return { success: false, message: "Invalid player id." };

  const parsed = parseInput(playerInputSchema, oPayload);
  if ("error" in parsed) return { success: false, message: parsed.error };

  try {
    // playerMatchId links the player to the dataset and is set once on create, so it isn't editable here.
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: parsed.data,
    });
    return {
      message: `Player ${updatedPlayer.name} updated successfully`,
      success: true,
      id: updatedPlayer.id,
    };
  } catch (error) {
    console.error("updatePlayer failed", error);
    return { message: GENERIC_ERROR, success: false };
  }
}
