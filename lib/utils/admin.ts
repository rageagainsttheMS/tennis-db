// Pure helpers with no server imports, so both auth.ts and proxy.ts can use them.

/**
 * Admin emails come from the ADMIN_EMAILS env var (comma-separated).
 * If the variable is unset, nobody is an admin.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
