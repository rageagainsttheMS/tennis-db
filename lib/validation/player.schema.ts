import { z } from "zod";
import { Backhand, Hand } from "@/generated/prisma/client";

/** Optional text: trimmed, with an empty value stored as null ("not entered"). */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);

/** An enum select where the empty option means "not entered". */
const optionalEnum = <T extends Record<string, string>>(values: T, message: string) =>
  z.preprocess((value) => (value === "" || value === undefined ? null : value), z.enum(values, { error: message }).nullable());

/**
 * Fields an admin may set on a player. Players are created by the seed loader, so the source's
 * ID and name are never taken from the client: unknown keys such as `sourceId`, `name` and `id`
 * are stripped. Server Actions accept any JSON from anyone, so this is the real contract.
 */
export const playerBioSchema = z.object({
  fullName: optionalText(120),
  nickName: optionalText(120),
  hand: optionalEnum(Hand, "Invalid hand."),
  backHand: optionalEnum(Backhand, "Invalid backhand."),
  country: optionalText(80),
  birthPlace: optionalText(120),
  turnedPro: optionalText(20),
  age: optionalText(20),
  profile: optionalText(10_000),
  image: optionalText(512),
});

export type PlayerBio = z.output<typeof playerBioSchema>;
/** What the bio form sends: any field may be missing, empty or null. */
export type PlayerBioInput = Partial<Record<keyof PlayerBio, string | null>>;
