import { getPlayers } from "@/lib/actions/player.actions";
import PlayersTable from "@/components/ui/PlayersTable";

const AdminPlayersPage = async () => {
  const players = await getPlayers();

  return <PlayersTable players={players} />;
};

export default AdminPlayersPage;