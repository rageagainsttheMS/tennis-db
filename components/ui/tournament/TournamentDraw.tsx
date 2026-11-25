"use client";
import { useState } from "react";
import { Box, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import type { MatchWithPlayers } from "@/types";
import { roundLabel } from "@/types/constants";
import { groupByRound } from "@/lib/stats/tournament-summary";
import { Chip } from "../shared/Segmented";
import DrawMatchCard from "./DrawMatchCard";

/** Rounds shown open when the page loads; later rounds start collapsed. */
const OPEN_ROUNDS = 3;

const anchor = (round: string) => `round-${round}`;
const countLabel = (count: number) => `${count} ${count === 1 ? "match" : "matches"}`;

/** A season's matches at one tournament, round by round, final first. */
const TournamentDraw = ({ matches }: { matches: MatchWithPlayers[] }) => {
  const rounds = groupByRound(matches);
  const [open, setOpen] = useState<Set<string>>(() => new Set(rounds.slice(0, OPEN_ROUNDS).map(([round]) => round)));

  const [active, setActive] = useState(rounds[0]?.[0]);

  const jumpTo = (round: string) => {
    setActive(round);
    setOpen((previous) => new Set(previous).add(round));
    requestAnimationFrame(() => document.getElementById(anchor(round))?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <>
      <Flex justify="space-between" align="center" gap={4} mb={8} wrap="wrap">
        <Flex gap={2} wrap="wrap">
          {rounds.map(([round]) => (
            <Chip key={round} selected={round === active} onClick={() => jumpTo(round)}>
              {roundLabel(round)}
            </Chip>
          ))}
        </Flex>
        <Text color="ink.muted" fontSize="sm">
          {countLabel(matches.length)}
        </Text>
      </Flex>

      {rounds.map(([round, roundMatches]) => {
        const isOpen = open.has(round);
        const wide = roundMatches.length >= 4;
        return (
          <Box key={round} id={anchor(round)} mb={10} scrollMarginTop="24px">
            {isOpen ? (
              <>
                <Flex align="baseline" gap={3} mb={4}>
                  <Heading as="h3" fontFamily="heading" fontWeight="bold" fontSize={{ base: "2xl", md: "3xl" }}>
                    {roundLabel(round)}
                  </Heading>
                  <Text color="ink.muted">{countLabel(roundMatches.length)}</Text>
                </Flex>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: wide ? "repeat(4, 1fr)" : "1fr 1fr" }} gap={4}>
                  {roundMatches.map((match) => (
                    <DrawMatchCard key={match.id} match={match} />
                  ))}
                </Grid>
              </>
            ) : (
              <Flex
                as="button"
                w="100%"
                justify="space-between"
                align="center"
                bg="card"
                borderWidth="1px"
                borderColor="line"
                borderRadius="xl"
                px={{ base: 5, md: 8 }}
                py={6}
                cursor="pointer"
                onClick={() => setOpen((previous) => new Set(previous).add(round))}
                aria-expanded={false}
                _hover={{ borderColor: "ink.muted" }}
              >
                <Text fontFamily="heading" fontWeight="bold" fontSize={{ base: "xl", md: "2xl" }}>
                  {roundLabel(round)}
                </Text>
                <Text fontWeight="semibold">Show {countLabel(roundMatches.length)} ↓</Text>
              </Flex>
            )}
          </Box>
        );
      })}
    </>
  );
};

export default TournamentDraw;
