"use server";
import { prisma } from "@/db/prisma";
import { ActionResult, Player } from "@/types";
import { Backhand, Hand } from "@prisma/client";

export async function createPlayer(oPayload: Player) {
  try {
    oPayload.rank = parseInt(oPayload.rank.toString(), 10);
    // Look up winnerId from Match table by winnerName
    const match = await prisma.match.findFirst({
      where: { winnerName: oPayload.name },
      select: { winnerId: true },
    });

    if(!match) {
      return {
        message: `No matches found for player ${oPayload.name}`,
        success: false,
      };
    }

    // Set playerMatchId to winnerId if found, otherwise keep existing or generate a new one
    const playerMatchId = match?.winnerId || oPayload.playerMatchId || crypto.randomUUID();
    const { hand, backHand, ...rest } = oPayload;
    const newPlayer = await prisma.player.create({
      data: {
        ...rest,
        playerMatchId,
        hand: hand as Hand,
        backHand: backHand as Backhand,
      },
    });
    const result: ActionResult = {
      message: `Player ${newPlayer?.name} created successfully`,
      success: true,
      id: newPlayer.id,
    };
    return result;
  } catch (error) {
    console.log(error);
    const result: ActionResult = {
      message: JSON.stringify(error),
      success: false,
    };
    return result;
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

export async function updatePlayer(id: string, oPayload: Player) {
  try {
    oPayload.rank = parseInt(oPayload.rank.toString(), 10);
    const { hand, backHand, ...rest } = oPayload;
    const { playerMatchId, ...restData } = rest;
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        ...restData,
        hand: hand as Hand,
        backHand: backHand as Backhand,
        ...(typeof playerMatchId === "string"
          ? { playerMatchId }
          : playerMatchId === undefined
          ? {}
          : { playerMatchId: undefined }),
      },
    });
    const result: ActionResult = {
      message: `Player ${updatedPlayer?.name} updated successfully`,
      success: true,
      id: updatedPlayer.id,
    };
    return result;
  } catch (error) {
    console.log(error);
    const result: ActionResult = {
      message: JSON.stringify(error),
      success: false,
    };
    return result;
  }
}
