import type { Metadata } from "next";
import TournamentsDirectory from "@/components/ui/TournamentsDirectory";
import { getTournaments } from "@/lib/actions/tournament.actions";
import { surfaceKey } from "@/lib/utils/display";

export const metadata: Metadata = { title: "Tournaments · Tennis DB" };

// Reads the database, so never prerender at build time (CI builds have no database).
export const dynamic = "force-dynamic";

const TournamentsPage = async ({ searchParams }: { searchParams: Promise<{ q?: string | string[]; surface?: string | string[] }> }) => {
  const { q, surface } = await searchParams;
  const tournaments = await getTournaments();
  return (
    <TournamentsDirectory
      tournaments={tournaments}
      initialQuery={typeof q === "string" ? q.slice(0, 120) : ""}
      initialSurface={typeof surface === "string" ? surfaceKey(surface) : null}
    />
  );
};

export default TournamentsPage;
