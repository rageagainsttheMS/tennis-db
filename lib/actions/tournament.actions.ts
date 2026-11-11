"use server";
import { prisma } from "@/db/prisma";
import { ActionResult, MATCH_INCLUDE } from "@/types";
import { parseInput } from "@/lib/validation";
import { tournamentInfoSchema, type TournamentInfoInput } from "@/lib/validation/tournament.schema";
import { requireAdmin } from "@/lib/utils/auth-guards";

const GENERIC_ERROR = "Something went wrong. Please try again.";
const SEARCH_LIMIT = 20;

export async function getTournaments(searchQuery?: string) {
  const query = searchQuery?.trim();
  return prisma.tournament.findMany({
    where: query ? { name: { contains: query, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
    take: query ? SEARCH_LIMIT : undefined,
  });
}

export async function getTournamentById(id: string) {
  if (typeof id !== "string" || !id) return null;
  return prisma.tournament.findUnique({ where: { id } });
}

/** Seasons with at least one match at this tournament, most recent first. */
export async function getTournamentSeasons(tournamentId: string): Promise<number[]> {
  const rows = await prisma.match.findMany({
    where: { tournamentId },
    distinct: ["season"],
    select: { season: true },
    orderBy: { season: "desc" },
  });
  return rows.map((row) => row.season);
}

export async function getTournamentMatches(tournamentId: string, season: number) {
  return prisma.match.findMany({
    where: { tournamentId, season },
    include: MATCH_INCLUDE,
    orderBy: { playedAt: "desc" },
  });
}

/** Updates the admin-entered details. The name, level and surface come from the match data. */
export async function updateTournament(id: string, input: TournamentInfoInput): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (typeof id !== "string" || !id) return { success: false, message: "Invalid tournament id." };

  const parsed = parseInput(tournamentInfoSchema, input);
  if ("error" in parsed) return { success: false, message: parsed.error };

  try {
    const updated = await prisma.tournament.update({ where: { id }, data: parsed.data });
    return { success: true, message: `Tournament ${updated.name} updated successfully`, id: updated.id };
  } catch (error) {
    console.error("updateTournament failed", error);
    return { success: false, message: GENERIC_ERROR };
  }
}
