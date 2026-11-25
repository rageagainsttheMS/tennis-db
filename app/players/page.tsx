import type { Metadata } from "next";
import PlayersDirectory from "@/components/ui/PlayersDirectory";
import { getPlayerDirectory } from "@/lib/actions/player.actions";

export const metadata: Metadata = { title: "Players · Tennis DB" };

// Reads the database, so never prerender at build time (CI builds have no database).
export const dynamic = "force-dynamic";

const PlayersPage = async ({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) => {
  const { q } = await searchParams;
  const players = await getPlayerDirectory();
  return <PlayersDirectory players={players} initialQuery={typeof q === "string" ? q.slice(0, 120) : ""} />;
};

export default PlayersPage;
