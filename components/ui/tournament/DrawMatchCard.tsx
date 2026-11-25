"use client";
import Link from "next/link";
import { Box, Flex, Text } from "@chakra-ui/react";
import type { MatchWithPlayers } from "@/types";
import { MATCH_STATUS_LABELS, ROUTES } from "@/types/constants";
import { parseScore } from "@/lib/utils/display";
import { displayName, formatMatchDate } from "@/lib/utils/utils";

const SideRow = ({ name, games, won }: { name: string; games: number[]; won: boolean }) => (
  <Flex align="center" gap={3}>
    <Box boxSize="10px" borderRadius="full" bg={won ? "ball.600" : "transparent"} flexShrink={0} />
    <Text flex="1" minW={0} truncate fontWeight={won ? "bold" : "normal"} color={won ? "ink" : "ink.muted"} fontSize="lg">
      {name}
    </Text>
    <Flex gap={3} className="tabular" fontWeight={won ? "bold" : "normal"} color={won ? "ink" : "ink.muted"} fontSize="lg">
      {games.map((value, index) => (
        <Text as="span" key={index} minW="0.8em" textAlign="center">
          {value}
        </Text>
      ))}
    </Flex>
  </Flex>
);

/** One match in a draw: date, winner (with a dot) above loser, and games per set. */
const DrawMatchCard = ({ match }: { match: MatchWithPlayers }) => {
  const { sets, note } = parseScore(match.score);
  const status = MATCH_STATUS_LABELS[match.status];
  return (
    <Link href={`${ROUTES.MATCH}/${match.id}`}>
      <Box bg="card" borderWidth="1px" borderColor="line" borderRadius="xl" px={6} py={5} h="100%" _hover={{ borderColor: "ink.muted" }}>
        <Flex justify="space-between" mb={3} gap={2}>
          <Text color="ink.muted" fontSize="sm">
            {formatMatchDate(match.playedAt)}
            {match.tournamentDetail && match.round === "TIE" ? ` · ${match.tournamentDetail}` : ""}
          </Text>
          {(status || note) && (
            <Text color="ink.muted" fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.06em">
              {status || note}
            </Text>
          )}
        </Flex>
        <Flex direction="column" gap={2}>
          <SideRow name={displayName(match.winner)} games={sets.map((set) => set.winner)} won />
          <SideRow name={displayName(match.loser)} games={sets.map((set) => set.loser)} won={false} />
        </Flex>
      </Box>
    </Link>
  );
};

export default DrawMatchCard;
