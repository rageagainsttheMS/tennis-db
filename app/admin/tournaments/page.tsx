import { auth } from "@/auth";
import { ROUTES } from "@/types/constants";
import { redirect } from "next/navigation";
import { getTournaments } from "@/lib/actions/tournament.actions";
import TournamentsTable from "@/components/ui/TournamentsTable";

const AdminTournamentsPage = async () => {
  const session = await auth();
  if (!session) {
    redirect(ROUTES.SIGNIN);
  }
  const tournaments = await getTournaments();

  return <TournamentsTable tournaments={tournaments} />;
};

export default AdminTournamentsPage;