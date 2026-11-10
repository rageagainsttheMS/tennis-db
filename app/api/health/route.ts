// Health endpoint for smoke tests and uptime monitors (cdk-nextjs 0.7 no longer health-checks
// Lambdas, so nothing in AWS calls it). Must stay public and cheap:
// it deliberately doesn't touch the database, so a cold Neon compute can't fail the check.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" });
}
