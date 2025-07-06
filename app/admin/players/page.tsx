import { auth } from "@/auth";
import { ROUTES } from "@/types/constants";
import { Box } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { redirect } from "next/navigation";

const testPlayers = [
  { name: "Novak Djokovic", age: 37, ranking: 1 },
  { name: "Carlos Alcaraz", age: 22, ranking: 2 },
  { name: "Jannik Sinner", age: 23, ranking: 3 },
  { name: "Daniil Medvedev", age: 28, ranking: 4 },
  { name: "Alexander Zverev", age: 27, ranking: 5 },
];

const AdminPlayersPage = async () => {
  const session = await auth();
  if (!session) {
    redirect(ROUTES.SIGNIN);
  }

  return (
    <Box mx="auto" ml={10} mt={8}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Player Name</Table.ColumnHeader>
            <Table.ColumnHeader>Age</Table.ColumnHeader>
            <Table.ColumnHeader>Ranking</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {testPlayers.map((player, idx) => (
            <Table.Row key={idx}>
              <Table.Cell>{player.name}</Table.Cell>
              <Table.Cell>{player.age}</Table.Cell>
              <Table.Cell>{player.ranking}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default AdminPlayersPage;
