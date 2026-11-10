import { z } from "zod";
import { Backhand, Hand } from "@/generated/prisma/client";

const text = (max: number) => z.string().trim().max(max);

/**
 * Fields a client may set on a player. Server Actions accept any JSON from anyone, so this
 * is the real contract. Unknown keys such as `id` or `playerMatchId` are stripped.
 */
export const playerInputSchema = z.object({
  name: text(120).min(1, "Name is required."),
  nickName: text(120).optional().transform((v) => v || null),
  hand: z.enum(Hand, { error: "Invalid hand." }),
  backHand: z.enum(Backhand, { error: "Invalid backhand." }),
  country: text(80).default(""),
  birthPlace: text(120).default(""),
  turnedPro: text(20).default(""),
  age: text(20).default(""),
  rank: z.coerce.number({ error: "Rank must be a whole number." }).int("Rank must be a whole number.").min(0),
  profile: text(10_000).default(""),
  image: text(512).default(""),
});

export type PlayerInput = z.infer<typeof playerInputSchema>;
