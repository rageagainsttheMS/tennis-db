'use server';
import { prisma } from "@/db/prisma";
import { ActionResult, Tournament } from "@/types";
import { parseInput } from "@/lib/validation";
import { tournamentInputSchema } from "@/lib/validation/tournament.schema";
import { requireAdmin } from "@/lib/utils/auth-guards";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function getTournaments(searchQuery?: string){
    return await prisma.tournament.findMany({
        where: searchQuery ? {
            name: {
                contains: searchQuery,
                mode: 'insensitive'
            }
        } : undefined,
        orderBy: {
            name: 'asc'
        }
    })
}

export async function getTournamentById(id: string) {
    const tournament = await prisma.tournament.findUnique({
        where: { id }
    });
    return tournament;
}

export async function getTournamentMatches(tournamentId: string) {
    const matches = await prisma.match.findMany({
        where: { tourneyId: tournamentId },
        orderBy: { tourneyDate: 'desc' },
    });
    return matches;
}

export async function createTournament(tournament: Tournament): Promise<ActionResult> {
    const denied = await requireAdmin();
    if (denied) return denied;

    const parsed = parseInput(tournamentInputSchema, tournament);
    if ("error" in parsed) return { success: false, message: parsed.error };

    try {
        // Link the tournament to the dataset through the tourney ID used in the matches table.
        const match = await prisma.match.findFirst({
            where: { tourneyName: parsed.data.name },
            select: { tourneyId: true },
        });

        if (!match?.tourneyId) {
            return {
                success: false,
                message: "Tournament not found in matches table",
            };
        }

        const createdTournament = await prisma.tournament.create({
            data: { ...parsed.data, id: match.tourneyId },
        });
        return {
            message: `Tournament ${createdTournament.name} created successfully`,
            success: true,
            id: createdTournament.id,
        };
    } catch (error) {
        console.error("createTournament failed", error);
        return { success: false, message: GENERIC_ERROR };
    }
}
