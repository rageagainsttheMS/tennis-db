"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Box, Button, Flex, Grid, Heading, Image, Tabs, Text } from "@chakra-ui/react";
import { LuPencil } from "react-icons/lu";
import type { MatchWithPlayers, Player } from "@/types";
import { ADMINROLE } from "@/types/constants";
import { latestRank, winLoss } from "@/lib/stats/match-stats";
import { winRate } from "@/lib/stats/player-summary";
import { ageFromBirthDate, displayName, formatHand, formatMatchDate } from "@/lib/utils/utils";
import { Card, Container, Eyebrow, Hero, HeroStat } from "./shared/Layout";
import { PlayerAvatar, useStoredImage } from "./shared/PlayerAvatar";
import PlayerBioEditor from "./player/PlayerBioEditor";
import PlayerMatches from "./player/PlayerMatches";
import PlayerOverview from "./player/PlayerOverview";

type Tab = "overview" | "matches" | "profile";

const TAB_STYLE = {
  color: "hero.muted",
  fontWeight: "medium",
  fontSize: "md",
  px: { base: 3, md: 6 },
  py: 4,
  h: "auto",
  borderRadius: 0,
  borderBottomWidth: "3px",
  borderColor: "transparent",
  _selected: { color: "hero.text", fontWeight: "semibold", borderColor: "ball.500" },
  _hover: { color: "hero.text" },
} as const;

const PlayerProfile = ({ player, matches }: { player: Player; matches: MatchWithPlayers[] }) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === ADMINROLE;
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState(false);
  const photo = useStoredImage(player.image);

  const name = displayName(player);
  const rank = latestRank(matches, player.id);
  const record = winLoss(matches, player.id);
  const rate = winRate(record);
  const firstSeason = matches.length ? Math.min(...matches.map((match) => match.season)) : null;
  const age = ageFromBirthDate(player.birthDate);
  const eyebrow = [player.country, formatHand(player.hand)].filter(Boolean).join(" · ");
  const compact = tab !== "overview";

  const startEditing = () => {
    setEditing(true);
    setTab("overview");
  };

  return (
    <Tabs.Root value={tab} onValueChange={(details) => setTab(details.value as Tab)} variant="plain" lazyMount>
      <Hero>
        <Container pt={{ base: 8, md: compact ? 8 : 12 }}>
          <Flex align="center" gap={{ base: 4, md: 8 }} mb={compact ? 6 : { base: 8, md: 10 }}>
            <PlayerAvatar
              name={name}
              image={player.image}
              size={compact ? { base: "64px", md: "104px" } : { base: "88px", md: "200px" }}
              variant="hero"
            />
            <Box flex="1" minW={0}>
              {!compact && eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              <Heading
                as="h1"
                fontFamily="heading"
                fontWeight="bold"
                fontSize={compact ? { base: "3xl", md: "5xl" } : { base: "4xl", md: "7xl" }}
                lineHeight="1.05"
                letterSpacing="-0.01em"
                mt={compact ? 0 : 2}
              >
                {name}
              </Heading>
              {compact ? (
                <Flex gap={{ base: 2, md: 6 }} mt={2} color="hero.muted" fontSize={{ base: "sm", md: "md" }} wrap="wrap">
                  {rank && (
                    <Text>
                      Ranking{" "}
                      <Text as="span" color="ball.500" fontWeight="bold">
                        {rank.rank}
                      </Text>{" "}
                      · {formatMatchDate(rank.asOf)}
                    </Text>
                  )}
                  {firstSeason && (
                    <Text>
                      Record since {firstSeason}{" "}
                      <Text as="span" color="hero.text" fontWeight="bold">
                        {record.wins}–{record.losses}
                      </Text>
                    </Text>
                  )}
                  {player.fullName && <Text>Listed as {player.name}</Text>}
                </Flex>
              ) : (
                player.fullName && (
                  <Text color="hero.muted" fontSize={{ base: "md", md: "lg" }} mt={2}>
                    Listed as {player.name}
                  </Text>
                )
              )}
            </Box>
            {isAdmin && !editing && (
              <Button
                onClick={startEditing}
                variant="outline"
                color="hero.text"
                borderColor="whiteAlpha.400"
                borderRadius="xl"
                size={{ base: "sm", md: "lg" }}
                _hover={{ bg: "court.800" }}
                flexShrink={0}
                alignSelf={{ base: "flex-start", md: "center" }}
              >
                <LuPencil /> Edit bio
              </Button>
            )}
          </Flex>

          {!compact && (
            <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={{ base: 3, md: 4 }} mb={{ base: 6, md: 10 }}>
              <HeroStat label="Ranking" value={rank?.rank ?? "—"} caption={rank ? `as of ${formatMatchDate(rank.asOf)}` : "no ranking in the data"} accent />
              <HeroStat label="Win–loss" value={`${record.wins}–${record.losses}`} caption={firstSeason ? `since ${firstSeason}` : "no matches yet"} />
              <HeroStat label="Win rate" value={rate === null ? "—" : `${rate}%`} caption="of decided matches" />
              {player.turnedPro ? (
                <HeroStat label="Turned pro" value={player.turnedPro} caption={age !== null ? `Age ${age}` : undefined} />
              ) : (
                <HeroStat label="Age" value={age ?? "—"} caption={age === null ? "not entered" : undefined} />
              )}
            </Grid>
          )}

          <Tabs.List gap={{ base: 0, md: 2 }} borderBottomWidth={0}>
            <Tabs.Trigger value="overview" {...TAB_STYLE}>
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger value="matches" {...TAB_STYLE}>
              Matches
            </Tabs.Trigger>
            <Tabs.Trigger value="profile" {...TAB_STYLE}>
              Profile
            </Tabs.Trigger>
          </Tabs.List>
        </Container>
      </Hero>

      <Container pt={{ base: 8, md: 12 }}>
        <Tabs.Content value="overview" p={0}>
          {editing ? (
            <PlayerBioEditor player={player} onDone={() => setEditing(false)} />
          ) : (
            <PlayerOverview player={player} matches={matches} onSeeMatches={() => setTab("matches")} />
          )}
        </Tabs.Content>
        <Tabs.Content value="matches" p={0}>
          <PlayerMatches matches={matches} playerId={player.id} />
        </Tabs.Content>
        <Tabs.Content value="profile" p={0}>
          <Card p={{ base: 5, md: 8 }}>
            <Flex direction={{ base: "column", md: "row" }} gap={8}>
              {photo && <Image src={photo} alt={name} boxSize={{ base: "200px", md: "260px" }} objectFit="cover" borderRadius="xl" flexShrink={0} />}
              <Text fontSize="lg" lineHeight="1.7" color={player.profile ? "ink" : "ink.muted"} whiteSpace="pre-wrap">
                {player.profile || "No profile has been written for this player yet."}
              </Text>
            </Flex>
          </Card>
        </Tabs.Content>
      </Container>
    </Tabs.Root>
  );
};

export default PlayerProfile;
