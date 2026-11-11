"use server";
import { prisma } from "@/db/prisma";
import { ActionResult, MATCH_INCLUDE } from "@/types";
import { parseInput } from "@/lib/validation";
import { playerBioSchema, type PlayerBioInput } from "@/lib/validation/player.schema";
import { requireAdmin } from "@/lib/utils/auth-guards";

const GENERIC_ERROR = "Something went wrong. Please try again.";
const SEARCH_LIMIT = 20;

/** Players whose source name or admin-entered full name contains `searchQuery`. */
export async function getPlayers(searchQuery?: string) {
  const query = searchQuery?.trim();
  return prisma.player.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { fullName: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    take: query ? SEARCH_LIMIT : undefined,
  });
}

export async function getPlayerById(id: string) {
  if (typeof id !== "string" || !id) return null;
  return prisma.player.findUnique({ where: { id } });
}

/** Every match the player won or lost, most recent first. */
export async function getPlayerMatches(playerId: string) {
  if (typeof playerId !== "string" || !playerId) return [];
  return prisma.match.findMany({
    where: { OR: [{ winnerId: playerId }, { loserId: playerId }] },
    include: MATCH_INCLUDE,
    orderBy: { playedAt: "desc" },
  });
}

/** Updates the admin-entered bio. The source's ID and name can't be changed. */
export async function updatePlayer(id: string, input: PlayerBioInput): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (typeof id !== "string" || !id) return { success: false, message: "Invalid player id." };

  const parsed = parseInput(playerBioSchema, input);
  if ("error" in parsed) return { success: false, message: parsed.error };

  try {
    const updated = await prisma.player.update({ where: { id }, data: parsed.data });
    return { success: true, message: `Player ${updated.fullName ?? updated.name} updated successfully`, id: updated.id };
  } catch (error) {
    console.error("updatePlayer failed", error);
    return { success: false, message: GENERIC_ERROR };
  }
}
