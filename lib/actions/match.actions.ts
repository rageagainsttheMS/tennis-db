"use server";
import { prisma } from "@/db/prisma";
import { MATCH_INCLUDE } from "@/types";

export async function getMatchById(id: number) {
  if (!Number.isInteger(id)) return null;
  return prisma.match.findUnique({ where: { id }, include: MATCH_INCLUDE });
}
