import { notFound } from "next/navigation";
import PlayerProfile from "@/components/ui/PlayerProfile";
import { getPlayerById, getPlayerMatches } from "@/lib/actions/player.actions";

const PlayerProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  const matches = await getPlayerMatches(player.id);
  return <PlayerProfile player={player} matches={matches} />;
};

export default PlayerProfilePage;
