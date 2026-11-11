import { notFound } from "next/navigation";
import TournamentDetails from "@/components/ui/TournamentDetails";
import { getTournamentById, getTournamentMatches, getTournamentSeasons } from "@/lib/actions/tournament.actions";

const TournamentPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string }>;
}) => {
  const { id } = await params;
  const { season: seasonParam } = await searchParams;

  const tournament = await getTournamentById(id);
  if (!tournament) notFound();

  const seasons = await getTournamentSeasons(tournament.id);
  // Default to the most recent season. An unknown ?season= falls back to it too.
  const requested = Number(seasonParam);
  const season = seasons.includes(requested) ? requested : (seasons[0] ?? null);
  const matches = season === null ? [] : await getTournamentMatches(tournament.id, season);

  return <TournamentDetails tournament={tournament} matches={matches} seasons={seasons} season={season} />;
};

export default TournamentPage;
