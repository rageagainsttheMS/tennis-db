import { auth } from "@/auth";
import { ROUTES } from "@/types/constants";
import { redirect } from "next/navigation";
import { getPlayers } from "@/lib/actions/player.actions";
import PlayersTable from "@/components/ui/PlayersTable";

const AdminPlayersPage = async () => {
  const session = await auth();
  if (!session) {
    redirect(ROUTES.SIGNIN);
  }

  const players = await getPlayers();

  return <PlayersTable players={players} />;
};

export default AdminPlayersPage;