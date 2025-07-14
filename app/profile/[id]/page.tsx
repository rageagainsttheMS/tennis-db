import PlayerProfile from "@/components/ui/PlayerProfile";
import { getPlayerById } from "@/lib/actions/player.actions";
import { redirect } from "next/navigation";

const PlayerProfilePage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  const player = await getPlayerById(id);
  if (!player) {
    redirect("/not-found");
  }

  return <PlayerProfile player={player} />;
};

export default PlayerProfilePage;
