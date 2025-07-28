'use client'
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Table } from "@chakra-ui/react";
import { ROUTES, TOURNAMENT_TYPES } from "@/types/constants";
import Link from "next/link";
import {Tournament } from "@/types";

const TournamentsTable = ({ tournaments }: { tournaments: Tournament[] }) => {
  const router = useRouter();

  return (
    <Box mx="auto" ml={10} mt={8}>
      <Flex justify="flex-end" mx={4}>
        <Link href={ROUTES.TOURNEYCREATE} passHref>
          <Button colorScheme="green" as="a" size="sm">
            Create Tournament
          </Button>
        </Link>
      </Flex>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Tournament Type</Table.ColumnHeader>
            <Table.ColumnHeader>Surface</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tournaments.map((tournament: Tournament) => (
            <Table.Row
              key={tournament.id}
              onClick={() => router.push(`/tournament/${tournament.id}`)}
              _hover={{ bg: "gray.100", cursor: "pointer" }}
            >
              <Table.Cell>{tournament.name}</Table.Cell>
              <Table.Cell> {TOURNAMENT_TYPES.find(type => type.value === tournament.tournamentType)?.label}</Table.Cell>
              <Table.Cell>{tournament.surface}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default TournamentsTable;

