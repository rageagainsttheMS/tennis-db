"use client";
import { useRouter } from "next/navigation";
import { Badge, Box, Table, Text } from "@chakra-ui/react";
import type { Tournament } from "@/types";
import { tournamentTypeLabel } from "@/types/constants";

/** Admin list of every tournament. Tournaments come from the match data; open one to edit it. */
const TournamentsTable = ({ tournaments }: { tournaments: Tournament[] }) => {
  const router = useRouter();

  return (
    <Box mx="auto" maxW="1000px" mt={8} px={4}>
      <Text color="gray.600" mb={4}>
        Tournaments are created from the match data. Open a tournament to add a description or image.
      </Text>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Level</Table.ColumnHeader>
            <Table.ColumnHeader>Surface</Table.ColumnHeader>
            <Table.ColumnHeader>Details</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tournaments.map((tournament) => (
            <Table.Row key={tournament.id} onClick={() => router.push(`/tournament/${tournament.id}`)} _hover={{ bg: "gray.100", cursor: "pointer" }}>
              <Table.Cell>{tournament.name}</Table.Cell>
              <Table.Cell>{tournamentTypeLabel(tournament.tournamentType)}</Table.Cell>
              <Table.Cell>
                {tournament.surface ?? "-"}
                {tournament.indoor ? " (indoor)" : ""}
              </Table.Cell>
              <Table.Cell>{tournament.description || tournament.image ? <Badge colorPalette="green">Entered</Badge> : "-"}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default TournamentsTable;
