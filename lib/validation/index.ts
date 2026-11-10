import type { z } from "zod";

/** Validates input and returns either the parsed data or the first error message, ready for an ActionResult. */
export function parseInput<T extends z.ZodType>(
  schema: T,
  input: unknown
): { data: z.infer<T> } | { error: string } {
  const result = schema.safeParse(input);
  if (result.success) return { data: result.data };
  return { error: result.error.issues[0]?.message ?? "Invalid input." };
}
