"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, chakra, Flex, Grid, Heading, Input, Table, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import type { DirectoryPlayer } from "@/types";
import { ADMINROLE, ROUTES } from "@/types/constants";
import { displayName } from "@/lib/utils/utils";
import { hasPlayerBio, LETTERS, letterFor } from "@/lib/utils/display";
import { AddedPill } from "./shared/Badges";
import { Card, Container, Eyebrow, Hero, HeroStat } from "./shared/Layout";
import { PlayerAvatar } from "./shared/PlayerAvatar";
import { Segmented } from "./shared/Segmented";

type BioFilter = "all" | "with" | "needs";

const PlayersDirectory = ({ players, initialQuery = "" }: { players: DirectoryPlayer[]; initialQuery?: string }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === ADMINROLE;

  const [query, setQuery] = useState(initialQuery);
  const [bioFilter, setBioFilter] = useState<BioFilter>("all");
  const withBio = useMemo(() => new Set(players.filter(hasPlayerBio).map((player) => player.id)), [players]);
  const lettersInUse = useMemo(() => new Set(players.map((player) => letterFor(player.name))), [players]);
  const [letter, setLetter] = useState(() => LETTERS.find((value) => lettersInUse.has(value)) ?? "A");

  const search = query.trim().toLowerCase();
  const bioMatches = (player: DirectoryPlayer) =>
    !isAdmin || bioFilter === "all" || (bioFilter === "with" ? withBio.has(player.id) : !withBio.has(player.id));

  // Typing searches every letter; otherwise the list shows one letter at a time.
  const visible = players.filter((player) =>
    search
      ? (player.name.toLowerCase().includes(search) || player.fullName?.toLowerCase().includes(search)) && bioMatches(player)
      : letterFor(player.name) === letter && bioMatches(player)
  );

  return (
    <>
      <Hero pb={{ base: 20, md: 24 }}>
        <Container pt={{ base: 8, md: 12 }}>
          <Flex justify="space-between" align="flex-end" gap={6} wrap="wrap">
            <Box>
              <Eyebrow>Directory</Eyebrow>
              <Heading as="h1" fontFamily="heading" fontWeight="bold" fontSize={{ base: "5xl", md: "7xl" }} lineHeight="1.05" mt={2} mb={3}>
                Players
              </Heading>
              <Text color="hero.muted" fontSize={{ base: "md", md: "lg" }}>
                {isAdmin
                  ? "Players are created from the match data. Open a player to add or edit their bio."
                  : "Everyone with an ATP tour-level match since 2021."}
              </Text>
            </Box>
            <Grid templateColumns={isAdmin ? "auto auto" : "auto"} gap={3}>
              <HeroStat value={players.length} caption="players" />
              {isAdmin && <HeroStat value={withBio.size} caption="with a bio" accent />}
            </Grid>
          </Flex>
        </Container>
      </Hero>

      <Container mt={{ base: -12, md: -14 }} position="relative">
        <Flex
          bg="card"
          borderRadius="2xl"
          boxShadow="0 16px 40px rgba(15,46,34,0.18)"
          p={{ base: 2, md: 3 }}
          pl={{ base: 4, md: 6 }}
          align="center"
          gap={3}
          wrap={{ base: "wrap", md: "nowrap" }}
        >
          <Flex align="center" gap={3} flex="1" minW="200px">
            <Box color="ink.muted">
              <LuSearch size={20} />
            </Box>
            <Input
              aria-label="Filter players by name"
              placeholder="Filter players by name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              border="none"
              fontSize="lg"
              px={0}
              h="52px"
              _focusVisible={{ outline: "none", boxShadow: "none" }}
              _placeholder={{ color: "ink.muted" }}
            />
          </Flex>
          {isAdmin && (
            <Segmented
              label="Bio"
              options={[
                { value: "all", label: "All" },
                { value: "with", label: "With bio" },
                { value: "needs", label: "Needs bio" },
              ]}
              value={bioFilter}
              onChange={setBioFilter}
            />
          )}
        </Flex>

        <Flex gap={1.5} wrap="wrap" mt={5} mb={5} aria-label="Jump to letter" role="group" opacity={search ? 0.45 : 1}>
          {LETTERS.map((value) => {
            const selected = !search && value === letter;
            const enabled = lettersInUse.has(value);
            return (
              <chakra.button
                type="button"
                key={value}
                aria-pressed={selected}
                disabled={!enabled}
                onClick={() => {
                  setQuery("");
                  setLetter(value);
                }}
                w={{ base: "36px", lg: "auto" }}
                flex={{ lg: "1" }}
                h={{ base: "36px", md: "48px" }}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={selected ? "court.900" : "line"}
                bg={selected ? "court.900" : "card"}
                color={selected ? "white" : enabled ? "ink" : "blackAlpha.300"}
                fontWeight="semibold"
                fontSize="sm"
                cursor={enabled ? "pointer" : "default"}
                _hover={enabled && !selected ? { borderColor: "ink.muted" } : undefined}
              >
                {value}
              </chakra.button>
            );
          })}
        </Flex>

        <Card overflow="hidden">
          <Flex justify="space-between" align="center" px={{ base: 4, md: 8 }} py={5} borderBottomWidth="1px" borderColor="line">
            <Text fontFamily="heading" fontWeight="bold" fontSize="2xl">
              {search ? `Results for “${query.trim()}”` : letter}
            </Text>
            <Text color="ink.muted" fontSize="sm">
              {visible.length} {visible.length === 1 ? "player" : "players"}
            </Text>
          </Flex>
          {visible.length === 0 ? (
            <Text px={{ base: 4, md: 8 }} py={10} color="ink.muted">
              No players match.
            </Text>
          ) : (
            <Table.Root size="lg" interactive>
              <Table.Header>
                <Table.Row bg="transparent">
                  <Table.ColumnHeader color="ink.muted" fontWeight="medium" pl={{ base: 4, md: 8 }}>
                    Name
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="ink.muted" fontWeight="medium" display={{ base: "none", md: "table-cell" }}>
                    Listed as
                  </Table.ColumnHeader>
                  {isAdmin && (
                    <Table.ColumnHeader color="ink.muted" fontWeight="medium" pr={{ base: 4, md: 8 }}>
                      Bio
                    </Table.ColumnHeader>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {visible.map((player) => {
                  const name = displayName(player);
                  const href = `${ROUTES.PLAYERPROFILE}/${player.id}`;
                  const bio = withBio.has(player.id);
                  return (
                    <Table.Row key={player.id} onClick={() => router.push(href)} cursor="pointer" bg="transparent">
                      <Table.Cell pl={{ base: 4, md: 8 }}>
                        <Flex align="center" gap={4}>
                          <PlayerAvatar name={name} size="40px" variant={player.fullName ? "rowHighlight" : "row"} />
                          <Link href={href} onClick={(event) => event.stopPropagation()}>
                            <Text fontWeight="semibold" color="ink">
                              {name}
                            </Text>
                          </Link>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell color="ink.muted" display={{ base: "none", md: "table-cell" }}>
                        {player.name}
                      </Table.Cell>
                      {isAdmin && (
                        <Table.Cell pr={{ base: 4, md: 8 }}>
                          {bio ? (
                            <AddedPill>Bio added</AddedPill>
                          ) : (
                            <Text as="span" fontWeight="semibold" textDecoration="underline" color="ink">
                              + Add bio
                            </Text>
                          )}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          )}
        </Card>
      </Container>
    </>
  );
};

export default PlayersDirectory;
