import { z } from "zod";
import { TournamentType } from "@/generated/prisma/client";

const text = (max: number) => z.string().trim().max(max);

/**
 * Fields a client may set on a tournament. The id is never taken from the client
 * (it comes from the matches table), so it's stripped along with any other unknown key.
 */
export const tournamentInputSchema = z.object({
  name: text(120).min(1, "Name is required."),
  tournamentType: z.enum(TournamentType, { error: "Invalid tournament type." }),
  drawSize: z.coerce
    .number({ error: "Draw size must be a number." })
    .int()
    .min(2, "Draw size must be between 2 and 256.")
    .max(256, "Draw size must be between 2 and 256."),
  surface: text(40).default(""),
  description: text(10_000).nullish().transform((v) => v || null),
  image: text(512).default(""),
});

export type TournamentInput = z.infer<typeof tournamentInputSchema>;
