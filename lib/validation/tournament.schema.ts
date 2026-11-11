import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);

/**
 * Fields an admin may set on a tournament. Tournaments are created by the seed loader, which
 * also owns the name, level and surface, so those (and the id) are stripped if a client sends them.
 */
export const tournamentInfoSchema = z.object({
  description: optionalText(10_000),
  image: optionalText(512),
  drawSize: z.preprocess(
    (value) => (value === "" || value === undefined || value === 0 ? null : value),
    z.coerce
      .number({ error: "Draw size must be a number." })
      .int("Draw size must be a whole number.")
      .min(2, "Draw size must be between 2 and 256.")
      .max(256, "Draw size must be between 2 and 256.")
      .nullable()
  ),
});

/** What the tournament form sends: any field may be missing, empty or null. */
export type TournamentInfoInput = {
  description?: string | null;
  image?: string | null;
  drawSize?: string | number | null;
};
