"use client";
import { useRouter } from "next/navigation";
import { Box, Table } from "@chakra-ui/react";
import { Match } from "@/types";
import moment from "moment";
import { ROUND_TYPES } from "@/types/constants";

const MatchesTable = ({ matches, playerMatchId }: { matches: Match[], playerMatchId?: string | null }) => {
  const router = useRouter();

  // Helper to get opponent name and result
  const getOpponentAndResult = (match: Match) => {
    if (!playerMatchId) return { opponent: "-", opponentId: undefined, won: false };
    if (match.winnerId === playerMatchId) {
      return { opponent: match.loserName, opponentId: match.loserId, won: true };
    } else if (match.loserId === playerMatchId) {
      return { opponent: match.winnerName, opponentId: match.winnerId, won: false };
    }
    return { opponent: "-", opponentId: undefined, won: false };
  };

  return (
    <Box mx="auto" ml={10} mt={8}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tournament</Table.ColumnHeader>
            <Table.ColumnHeader>Surface</Table.ColumnHeader>
            <Table.ColumnHeader>Date</Table.ColumnHeader>
            <Table.ColumnHeader>Opponent</Table.ColumnHeader>
            <Table.ColumnHeader>Score</Table.ColumnHeader>
            <Table.ColumnHeader>Round</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {matches.map((match: Match) => {
            const { opponent, opponentId, won } = getOpponentAndResult(match);
            const rowBg = won ? "green.50" : "red.50";
            return (
              <Table.Row
                key={match.id}
                onClick={() => router.push(`/match/${match.id}`)}
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                bg={rowBg}
              >
                <Table.Cell
                  color="blue.600"
                  textDecoration="underline"
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/tournament/${match.tourneyId}`);
                  }}
                >
                  {match.tourneyName}
                </Table.Cell>
                <Table.Cell>{match.surface}</Table.Cell>
                <Table.Cell>{moment(match.tourneyDate).format("MMM D, YYYY")}</Table.Cell>
                <Table.Cell
                  color={opponentId ? "blue.600" : undefined}
                  textDecoration={opponentId ? "underline" : undefined}
                  cursor={opponentId ? "pointer" : undefined}
                  onClick={opponentId ? ((e) => {
                    e.stopPropagation();
                    router.push(`/profile/${opponentId}`);
                  }) : undefined}
                >
                  {opponent}
                </Table.Cell>
                <Table.Cell>{match.score}</Table.Cell>
                <Table.Cell> {ROUND_TYPES.find(round => round.value === match.round)?.label}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default MatchesTable;
