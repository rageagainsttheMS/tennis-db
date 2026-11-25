"use client";
import Link from "next/link";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { LuTrophy } from "react-icons/lu";
import type { MatchWithPlayers, Player } from "@/types";
import { ROUTES } from "@/types/constants";
import { latestTitles, recentForm } from "@/lib/stats/player-summary";
import { splitNicknames } from "@/lib/utils/display";
import { ageFromBirthDate, displayName, formatBackhand, formatHand, formatMatchDate } from "@/lib/utils/utils";
import { ResultChip } from "../shared/Badges";
import { Card, SectionHeading } from "../shared/Layout";

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Card px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }} borderRadius="xl" minW={0}>
    <Text color="ink.muted" fontSize="sm" mb={1}>
      {label}
    </Text>
    <Text fontWeight="semibold" fontSize="lg" color={value ? "ink" : "ink.muted"}>
      {value || "—"}
    </Text>
  </Card>
);

const FORM_LENGTH = 15;

/** The overview tab: personal details, nicknames, recent form and latest titles. */
const PlayerOverview = ({ player, matches, onSeeMatches }: { player: Player; matches: MatchWithPlayers[]; onSeeMatches: () => void }) => {
  const age = ageFromBirthDate(player.birthDate);
  const nicknames = splitNicknames(player.nickName);
  const form = recentForm(matches, player.id, FORM_LENGTH);
  const titles = latestTitles(matches, player.id, 3);

  return (
    <Grid templateColumns={{ base: "1fr", lg: "1fr 400px" }} gap={{ base: 8, lg: 12 }} alignItems="start">
      <Box>
        <SectionHeading>Personal details</SectionHeading>
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={{ base: 3, md: 4 }} mb={10}>
          <Detail label="Country" value={player.country} />
          <Detail label="Age" value={age} />
          <Detail label="Plays" value={formatHand(player.hand)} />
          <Detail label="Backhand" value={formatBackhand(player.backHand)} />
          <Detail label="Birth place" value={player.birthPlace} />
          <Detail label="Turned pro" value={player.turnedPro} />
        </Grid>

        {nicknames.length > 0 && (
          <>
            <SectionHeading>Also known as</SectionHeading>
            <Flex gap={3} wrap="wrap">
              {nicknames.map((nickname) => (
                <Box key={nickname} px={5} py={2.5} bg="card" borderWidth="1px" borderColor="line" borderRadius="full" fontSize="md">
                  {nickname}
                </Box>
              ))}
            </Flex>
          </>
        )}
      </Box>

      <Flex direction="column" gap={6}>
        <Card p={{ base: 5, md: 7 }}>
          <Flex justify="space-between" align="baseline" mb={4} gap={2}>
            <Text fontFamily="heading" fontWeight="bold" fontSize="2xl">
              Recent form
            </Text>
            {form.length > 0 && (
              <Text color="ink.muted" fontSize="sm">
                Last {form.length}, newest first
              </Text>
            )}
          </Flex>
          {form.length === 0 ? (
            <Text color="ink.muted">No matches played yet.</Text>
          ) : (
            <Flex gap={2} wrap="wrap">
              {form.map((result, index) => (
                <ResultChip key={index} won={result === "W"} size="lg" />
              ))}
            </Flex>
          )}
        </Card>

        <Card p={{ base: 5, md: 7 }}>
          <Text fontFamily="heading" fontWeight="bold" fontSize="2xl" mb={2}>
            Latest titles
          </Text>
          {titles.length === 0 ? (
            <Text color="ink.muted" py={3}>
              No tour-level titles since 2021.
            </Text>
          ) : (
            titles.map((final) => (
              <Link key={final.id} href={`${ROUTES.MATCH}/${final.id}`}>
                <Flex align="center" gap={4} py={4} borderTopWidth="1px" borderColor="line" _hover={{ bg: "page" }}>
                  <Flex boxSize="48px" borderRadius="lg" bg="ball.500" color="court.900" align="center" justify="center" flexShrink={0}>
                    <LuTrophy size={22} />
                  </Flex>
                  <Box flex="1" minW={0}>
                    <Text fontWeight="semibold" fontSize="lg" color="ink">
                      {final.tournament.name}
                    </Text>
                    <Text color="ink.muted" fontSize="sm">
                      {formatMatchDate(final.playedAt)} · d. {displayName(final.loser)}
                    </Text>
                  </Box>
                  <Text className="tabular" color="ink" whiteSpace="nowrap" letterSpacing="0.04em">
                    {final.score}
                  </Text>
                </Flex>
              </Link>
            ))
          )}
          <Box as="button" onClick={onSeeMatches} mt={3} fontWeight="semibold" textDecoration="underline" color="ink" cursor="pointer">
            See all matches →
          </Box>
        </Card>
      </Flex>
    </Grid>
  );
};

export default PlayerOverview;
