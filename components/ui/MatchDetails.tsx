"use client";

import Link from "next/link";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import type { MatchWithPlayers, PlayerSummary } from "@/types";
import { MATCH_STATUS_LABELS, ROUTES, roundLabel } from "@/types/constants";
import { getStatRows } from "@/lib/stats/match-stats";
import { parseScore } from "@/lib/utils/display";
import { displayName, formatMatchDate } from "@/lib/utils/utils";
import { OutcomePill, SurfaceBadge } from "./shared/Badges";
import { Card, Container, Hero, SectionHeading } from "./shared/Layout";
import { PlayerAvatar } from "./shared/PlayerAvatar";

const PlayerSide = ({ player, rank, won }: { player: PlayerSummary; rank: number | null; won: boolean }) => {
  const name = displayName(player);
  return (
    <Flex direction="column" align="center" textAlign="center" gap={3} opacity={won ? 1 : 0.75}>
      <PlayerAvatar name={name} image={player.image} size={{ base: "72px", md: "112px" }} variant="hero" />
      <Link href={`${ROUTES.PLAYERPROFILE}/${player.id}`}>
        <Text fontFamily="heading" fontWeight="bold" fontSize={{ base: "lg", md: "2xl" }} _hover={{ textDecoration: "underline" }}>
          {name}
        </Text>
      </Link>
      <Flex gap={2} align="center" color="hero.muted" fontSize="sm">
        {won && <OutcomePill label="Winner" highlight />}
        {rank !== null && <Text>Rank {rank}</Text>}
      </Flex>
    </Flex>
  );
};

const MatchDetails = ({ match }: { match: MatchWithPlayers }) => {
  const stats = getStatRows(match);
  const status = MATCH_STATUS_LABELS[match.status];
  const { sets, note } = parseScore(match.score);

  return (
    <>
      <Hero pb={{ base: 10, md: 14 }}>
        <Container pt={{ base: 8, md: 12 }}>
          <Flex justify="space-between" align="center" gap={4} wrap="wrap" mb={{ base: 8, md: 12 }}>
            <Box>
              <Link href={`${ROUTES.TOURNAMENT}/${match.tournament.id}?season=${match.season}`}>
                <Text fontFamily="heading" fontWeight="bold" fontSize={{ base: "2xl", md: "3xl" }} _hover={{ textDecoration: "underline" }}>
                  {match.tournament.name} {match.season}
                </Text>
              </Link>
              <Text color="hero.muted" mt={1}>
                {[roundLabel(match.round), formatMatchDate(match.playedAt), match.tournamentDetail].filter(Boolean).join(" · ")}
              </Text>
            </Box>
            <Flex gap={2} align="center">
              <SurfaceBadge surface={match.surface} indoor={match.indoor} size="md" />
              {status && <OutcomePill label={status} highlight={false} />}
            </Flex>
          </Flex>

          <Grid templateColumns="1fr auto 1fr" gap={{ base: 3, md: 10 }} alignItems="center">
            <PlayerSide player={match.winner} rank={match.winnerRank} won />
            <Box textAlign="center">
              {sets.length > 0 ? (
                <Flex direction="column" gap={1} className="tabular" fontFamily="heading" fontWeight="bold" fontSize={{ base: "2xl", md: "4xl" }}>
                  <Flex gap={{ base: 2, md: 4 }} justify="center" color="ball.500">
                    {sets.map((set, index) => (
                      <Text as="span" key={index}>
                        {set.winner}
                      </Text>
                    ))}
                  </Flex>
                  <Flex gap={{ base: 2, md: 4 }} justify="center" color="hero.muted">
                    {sets.map((set, index) => (
                      <Text as="span" key={index}>
                        {set.loser}
                      </Text>
                    ))}
                  </Flex>
                </Flex>
              ) : null}
              {note && (
                <Text mt={2} fontWeight="semibold" color="hero.muted">
                  {note}
                </Text>
              )}
              <Text fontSize="sm" color="hero.muted" mt={3}>
                Best of {match.bestOf}
              </Text>
            </Box>
            <PlayerSide player={match.loser} rank={match.loserRank} won={false} />
          </Grid>
        </Container>
      </Hero>

      <Container pt={{ base: 8, md: 12 }} maxW="900px">
        <SectionHeading>Match statistics</SectionHeading>
        <Card px={{ base: 4, md: 8 }} py={2}>
          {stats.length === 0 ? (
            <Text py={6} textAlign="center" color="ink.muted">
              No statistics are available for this match.
            </Text>
          ) : (
            <>
              <Grid templateColumns={{ base: "1fr 1.2fr 1fr", md: "1fr 2fr 1fr" }} gap={4} py={4} borderBottomWidth="1px" borderColor="line" fontSize="sm" color="ink.muted" fontWeight="semibold">
                <Text textAlign="right" truncate>
                  <Box as="span" display={{ base: "inline", md: "none" }}>
                    {match.winner.name}
                  </Box>
                  <Box as="span" display={{ base: "none", md: "inline" }}>
                    {displayName(match.winner)}
                  </Box>
                </Text>
                <Box />
                <Text truncate>
                  <Box as="span" display={{ base: "inline", md: "none" }}>
                    {match.loser.name}
                  </Box>
                  <Box as="span" display={{ base: "none", md: "inline" }}>
                    {displayName(match.loser)}
                  </Box>
                </Text>
              </Grid>
              {stats.map((row, index) => (
                <Grid key={row.label} templateColumns={{ base: "1fr 1.2fr 1fr", md: "1fr 2fr 1fr" }} gap={4} py={4} alignItems="center" borderTopWidth={index ? "1px" : 0} borderColor="line">
                  <Text textAlign="right" fontWeight="bold" fontSize="lg" className="tabular">
                    {row.winner}
                  </Text>
                  <Text textAlign="center" color="ink.muted" fontSize="sm">
                    {row.label}
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="ink.muted" className="tabular">
                    {row.loser}
                  </Text>
                </Grid>
              ))}
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default MatchDetails;
