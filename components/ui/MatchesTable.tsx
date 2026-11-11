"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, NativeSelect, Table, Text } from "@chakra-ui/react";
import type { MatchWithPlayers } from "@/types";
import { roundLabel } from "@/types/constants";
import { displayName, formatMatchDate } from "@/lib/utils/utils";

const PAGE_SIZE = 25;

/** A player's matches, with a season filter and pages of 25. */
const MatchesTable = ({ matches, playerId }: { matches: MatchWithPlayers[]; playerId: string }) => {
  const router = useRouter();
  const seasons = useMemo(() => [...new Set(matches.map((match) => match.season))].sort((a, b) => b - a), [matches]);
  const [season, setSeason] = useState<string>("all");
  const [page, setPage] = useState(0);

  const filtered = season === "all" ? matches : matches.filter((match) => match.season === Number(season));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (matches.length === 0) {
    return (
      <Text mt={8} color="gray.500">
        No matches found for this player.
      </Text>
    );
  }

  return (
    <Box mx="auto" mt={8}>
      <Flex justify="space-between" align="center" mb={4} gap={4}>
        <NativeSelect.Root size="sm" width="160px">
          <NativeSelect.Field
            aria-label="Season"
            value={season}
            onChange={(event) => {
              setSeason(event.currentTarget.value);
              setPage(0);
            }}
          >
            <option value="all">All seasons</option>
            {seasons.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Text fontSize="sm" color="gray.600">
          {filtered.length} matches
        </Text>
      </Flex>

      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Date</Table.ColumnHeader>
            <Table.ColumnHeader>Tournament</Table.ColumnHeader>
            <Table.ColumnHeader>Round</Table.ColumnHeader>
            <Table.ColumnHeader>Opponent</Table.ColumnHeader>
            <Table.ColumnHeader>Result</Table.ColumnHeader>
            <Table.ColumnHeader>Score</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visible.map((match) => {
            const won = match.winnerId === playerId;
            const opponent = won ? match.loser : match.winner;
            return (
              <Table.Row
                key={match.id}
                onClick={() => router.push(`/match/${match.id}`)}
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                bg={won ? "green.50" : "red.50"}
              >
                <Table.Cell whiteSpace="nowrap">{formatMatchDate(match.playedAt)}</Table.Cell>
                <Table.Cell
                  color="blue.600"
                  textDecoration="underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/tournament/${match.tournament.id}?season=${match.season}`);
                  }}
                >
                  {match.tournament.name}
                </Table.Cell>
                <Table.Cell>{roundLabel(match.round)}</Table.Cell>
                <Table.Cell
                  color="blue.600"
                  textDecoration="underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/profile/${opponent.id}`);
                  }}
                >
                  {displayName(opponent)}
                </Table.Cell>
                <Table.Cell fontWeight="semibold">{won ? "W" : "L"}</Table.Cell>
                <Table.Cell>{match.score}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>

      {pageCount > 1 && (
        <Flex justify="center" align="center" gap={4} mt={4}>
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Text fontSize="sm">
            Page {page + 1} of {pageCount}
          </Text>
          <Button size="sm" variant="outline" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default MatchesTable;
