'use server';
import { prisma } from "@/db/prisma";


export async function getMatchTest(){
    return await prisma.match.findFirst({
        where : { winnerName : 'Novak Djokovic'}
    })
}