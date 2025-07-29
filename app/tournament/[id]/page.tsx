import { getTournamentById, getTournamentMatches } from "@/lib/actions/tournament.actions";
import { redirect } from "next/navigation";
import TournamentDetails from "@/components/ui/TournamentDetails";
import { auth } from "@/auth";
import { ADMINROLE } from "@/types/constants";
import { Box, Button, Text } from "@chakra-ui/react";
import Link from "next/link";

const TournamentPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if(!session) {
    redirect("/signin");
  }

  const tournament = await getTournamentById(id);
  if (!tournament) {
    if (session?.user?.role === ADMINROLE) {
      return (
        <Box textAlign="center" mt={20}>
          <Text>This tournament does not exist yet. Would you like to create it? </Text>
           <Link href={`/admin/tournaments/create`}>
             <Button mt={4} colorScheme="blue">
            Create
          </Button>
           </Link>
        </Box>
      );
    } else {
      redirect("/not-found");
    }
  }
  const matches = await getTournamentMatches(tournament.id);

  return <TournamentDetails tournament={tournament} matches={matches} />;
};

export default TournamentPage;
