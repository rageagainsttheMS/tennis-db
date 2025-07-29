import { auth } from "@/auth";
import PlayerProfile from "@/components/ui/PlayerProfile";
import { getPlayerById, getPlayerMatches } from "@/lib/actions/player.actions";
import { ADMINROLE } from "@/types/constants";
import { Box, Button, Link, Text } from "@chakra-ui/react";
import { redirect } from "next/navigation";

const PlayerProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  const player = await getPlayerById(id);
  const matches = await getPlayerMatches(player?.playerMatchId || "");
  if (!player) {
        if (session?.user?.role === ADMINROLE) {
          return (
            <Box textAlign="center" mt={20}>
              <Text>This player profile does not exist yet. Would you like to create it? </Text>
               <Link href={`/admin/players/create`}>
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

  return <PlayerProfile player={player} matches={matches} />;
};

export default PlayerProfilePage;
