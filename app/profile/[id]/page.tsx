import PlayerProfile from "@/components/ui/PlayerProfile";
import { getPlayerById, getPlayerMatches } from "@/lib/actions/player.actions";
import { redirect } from "next/navigation";

const PlayerProfilePage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  const player = await getPlayerById(id);
    if (!player) {
    redirect("/not-found");
  }
  const matches = await getPlayerMatches(player?.playerMatchId || "");

  return <PlayerProfile player={player} matches={matches} />;
};

export default PlayerProfilePage;
