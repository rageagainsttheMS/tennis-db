'use server';
import { prisma } from "@/db/prisma";
import { ActionResult, Tournament } from "@/types";


export async function getTournaments(){
    return await prisma.tournament.findMany()
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

export async function createTournament(tournament: Tournament) {

    //find tourney ID from matches table
    const tourneyID = await prisma.match.findFirst({
        where: {
            tourneyName: tournament.name
        },
        select: {
            tourneyId: true
        }
    });

    if(!tourneyID) {
        return {
            success: false,
            message: "Tournament not found in matches table"
        };
    }

    tournament.id = tourneyID.tourneyId;

    const createdTournament = await prisma.tournament.create({
        data: tournament
    });
    const result: ActionResult = {
      message: `Tournament ${createdTournament?.name} created successfully`,
      success: true,
      id: createdTournament.id,
    };
    return result;
}