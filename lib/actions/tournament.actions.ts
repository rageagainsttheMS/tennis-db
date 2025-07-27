'use server';
import { prisma } from "@/db/prisma";
import { ActionResult, Tournament } from "@/types";


export async function getTournaments(){
    return await prisma.tournament.findMany()
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