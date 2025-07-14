"use server";
import { prisma } from "@/db/prisma";
import { ActionResult, Player } from "@/types";
import { Backhand, Hand } from "@prisma/client";

export async function createPlayer(oPayload: Player) {
  try {
    oPayload.rank = parseInt(oPayload.rank.toString(), 10);
    const { hand, backHand, ...rest } = oPayload;
    const newPlayer = await prisma.player.create({
      data: {
        ...rest,
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

export async function getPlayers() {
    const players = await prisma.player.findMany();
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
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        ...rest,
        hand: hand as Hand,
        backHand: backHand as Backhand,
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
