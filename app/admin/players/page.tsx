import { auth } from "@/auth";
import { ROUTES } from "@/types/constants";
import { Box, Button, Flex, Table } from "@chakra-ui/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlayers } from "@/lib/actions/player.actions";

const AdminPlayersPage = async () => {
  const session = await auth();
  if (!session) {
    redirect(ROUTES.SIGNIN);
  }

  const players = await getPlayers();
  return (
    <Box mx="auto" ml={10} mt={8}>
      <Flex justify="flex-end" mx={4}>
        <Link href={ROUTES.PLAYERCREATE} passHref>
          <Button colorScheme="green" as="a" size="sm">
            Create Player
          </Button>
        </Link>
      </Flex>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Player Name</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>Ranking</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {players.map((player, idx) => (
            <Table.Row key={idx}>
              <Table.Cell>{player.name}</Table.Cell>
              <Table.Cell>{player.age}</Table.Cell>
              <Table.Cell>{player.rank}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default AdminPlayersPage;