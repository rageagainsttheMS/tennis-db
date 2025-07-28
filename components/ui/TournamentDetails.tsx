"use client";
import { Match, Tournament } from "@/types";
import { ROUND_TYPES, TOURNAMENT_TYPES } from "@/types/constants";
import { Box, Heading, Badge, Flex, Table, Tabs, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const TournamentDetails = ({
  tournament,
  matches,
}: {
  tournament: Tournament;
  matches: Match[];
}) => {
  const router = useRouter();
  return (
    <Box mx="auto" mt={10} maxW="1200px">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h1" size="4xl">
          {tournament.name}
        </Heading>
      </Flex>

      {/* Overview content */}
      <Flex align="center" mb={6} gap={4}>
        <Box>
          <Badge colorScheme="green" fontSize="1em" mb={2}>
            {
              TOURNAMENT_TYPES.find(
                (type) => type.value === tournament.tournamentType
              )?.label
            }
          </Badge>
          <Badge colorScheme="green" fontSize="1em" ml={4}>
            {tournament.surface}
          </Badge>
        </Box>
      </Flex>

      <Tabs.Root defaultValue="overview" mb={8}>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="profile">Matches</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview">
          <Text fontSize="md">
            {tournament.description || "No description available"}
          </Text>
        </Tabs.Content>
        <Tabs.Content value="profile">
          {/* Matches content */}
          <Box mx="auto" ml={10} mt={8}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Players</Table.ColumnHeader>
                  <Table.ColumnHeader>Winner</Table.ColumnHeader>
                  <Table.ColumnHeader>Score</Table.ColumnHeader>
                  <Table.ColumnHeader>Round</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {matches.map((match: Match) => {
                  return (
                    <Table.Row
                      key={match.id}
                      onClick={() => router.push(`/match/${match.id}`)}
                      _hover={{ bg: "gray.100", cursor: "pointer" }}
                    >
                      <Table.Cell>
                        {match.winnerName} vs {match.loserName}
                      </Table.Cell>
                      <Table.Cell>{match.winnerName}</Table.Cell>
                      <Table.Cell>{match.score}</Table.Cell>
                      <Table.Cell>{ROUND_TYPES.find(round => round.value === match.round)?.label}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default TournamentDetails;
