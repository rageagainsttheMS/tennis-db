import PlayerProfile from "@/components/ui/PlayerProfile";
import { getPlayerById, getPlayerMatches } from "@/lib/actions/player.actions";
import { redirect } from "next/navigation";

const PlayerProfilePage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  const player = await getPlayerById(id);
  const matches = await getPlayerMatches(player?.playerMatchId || "");
  if (!player) {
    redirect("/not-found");
  }

  return <PlayerProfile player={player} matches={matches} />;
};

export default PlayerProfilePage;
