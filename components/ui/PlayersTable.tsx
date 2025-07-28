'use client'
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Table } from "@chakra-ui/react";
import { ROUTES } from "@/types/constants";
import Link from "next/link";
import { PlayerWithID } from "@/types";

const PlayersTable = ({ players }: { players: PlayerWithID[] }) => {
  const router = useRouter();

  return (
    <Box mx="auto" ml={10} mt={8}>
      <Flex justify="flex-end" mx={4}>
        <Link href={ROUTES.PLAYERCREATE} passHref>
          <Button colorScheme="green" size="sm">
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
          {players.map((player: PlayerWithID) => (
            <Table.Row
              key={player.id}
              onClick={() => router.push(`/profile/${player.id}`)}
              _hover={{ bg: "gray.100", cursor: "pointer" }}
            >
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

export default PlayersTable;

