import { getTournaments } from "@/lib/actions/tournament.actions";
import TournamentsTable from "@/components/ui/TournamentsTable";

const AdminTournamentsPage = async () => {
  const tournaments = await getTournaments();

  return <TournamentsTable tournaments={tournaments} />;
};

export default AdminTournamentsPage;