'use server';
import { prisma } from "@/db/prisma";
import { ActionResult, Tournament } from "@/types";


export async function getTournaments(){
    return await prisma.tournament.findMany()
}

export async function createTournament(tournament: Tournament) {
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