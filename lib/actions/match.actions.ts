'use server';
import { prisma } from "@/db/prisma";


export async function getMatchById(id: number){
    const match = await prisma.match.findUnique({
        where: { id : id }
    });
    return match;
}