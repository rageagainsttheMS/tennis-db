"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, Flex, Heading, Input, NativeSelect, Table, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import type { Tournament } from "@/types";
import { ADMINROLE, ROUTES, TOURNAMENT_TYPES } from "@/types/constants";
import { hasTournamentDetails, surfaceKey, type SurfaceKey } from "@/lib/utils/display";
import { AddedPill, LevelBadge, SurfaceDot } from "./shared/Badges";
import { Card, Container, Eyebrow, Hero } from "./shared/Layout";
import { Chip } from "./shared/Segmented";

const SURFACE_CHIPS: { key: SurfaceKey; label: string; color: string }[] = [
  { key: "hard", label: "Hard", color: "surface.hard" },
  { key: "clay", label: "Clay", color: "surface.clay" },
  { key: "grass", label: "Grass", color: "surface.grass" },
];

const TournamentsDirectory = ({
  tournaments,
  initialQuery = "",
  initialSurface = null,
}: {
  tournaments: Tournament[];
  initialQuery?: string;
  initialSurface?: SurfaceKey | null;
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === ADMINROLE;

  const [query, setQuery] = useState(initialQuery);
  const [level, setLevel] = useState("all");
  const [surface, setSurface] = useState<SurfaceKey | null>(initialSurface);
  const [indoorOnly, setIndoorOnly] = useState(false);

  // Only offer levels that some tournament has.
  const levels = useMemo(() => {
    const present = new Set(tournaments.map((tournament) => tournament.tournamentType));
    return TOURNAMENT_TYPES.filter((type) => present.has(type.value));
  }, [tournaments]);

  const search = query.trim().toLowerCase();
  const visible = tournaments.filter(
    (tournament) =>
      (!search || tournament.name.toLowerCase().includes(search)) &&
      (level === "all" || tournament.tournamentType === level) &&
      (!surface || surfaceKey(tournament.surface) === surface) &&
      (!indoorOnly || tournament.indoor)
  );

  return (
    <>
      <Hero pb={{ base: 20, md: 24 }}>
        <Container pt={{ base: 8, md: 12 }}>
          <Eyebrow>Directory</Eyebrow>
          <Heading as="h1" fontFamily="heading" fontWeight="bold" fontSize={{ base: "5xl", md: "7xl" }} lineHeight="1.05" mt={2} mb={3}>
            Tournaments
          </Heading>
          <Text color="hero.muted" fontSize={{ base: "md", md: "lg" }} maxW="640px">
            {isAdmin
              ? "Tournaments are created from the match data. Open one to add a description or image."
              : "Every ATP tour-level event since 2021, from the Grand Slams to the 250s."}
          </Text>
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
              aria-label="Filter tournaments by name"
              placeholder="Filter by name"
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
          <NativeSelect.Root size="lg" width={{ base: "100%", md: "240px" }}>
            <NativeSelect.Field aria-label="Level" value={level} onChange={(event) => setLevel(event.currentTarget.value)} bg="page" borderColor="line" fontWeight="medium">
              <option value="all">All levels</option>
              {levels.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Flex>

        <Flex gap={2} wrap="wrap" mt={5} mb={5}>
          <Chip selected={!surface} onClick={() => setSurface(null)}>
            All surfaces
          </Chip>
          {SURFACE_CHIPS.map((chip) => (
            <Chip key={chip.key} selected={surface === chip.key} onClick={() => setSurface(surface === chip.key ? null : chip.key)}>
              <Box boxSize="12px" borderRadius="full" bg={chip.color} borderWidth={surface === chip.key ? "2px" : 0} borderColor="white" />
              {chip.label}
            </Chip>
          ))}
          <Chip selected={indoorOnly} onClick={() => setIndoorOnly(!indoorOnly)}>
            Indoor only
          </Chip>
        </Flex>

        <Card overflow="hidden">
          {visible.length === 0 ? (
            <Text px={{ base: 4, md: 8 }} py={10} color="ink.muted">
              No tournaments match these filters.
            </Text>
          ) : (
            <Table.Root size="lg" interactive>
              <Table.Header>
                <Table.Row bg="transparent">
                  <Table.ColumnHeader color="ink.muted" fontWeight="medium" pl={{ base: 4, md: 8 }}>
                    Tournament
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="ink.muted" fontWeight="medium">
                    Level
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="ink.muted" fontWeight="medium" display={{ base: "none", md: "table-cell" }}>
                    Surface
                  </Table.ColumnHeader>
                  {isAdmin && (
                    <Table.ColumnHeader color="ink.muted" fontWeight="medium" pr={{ base: 4, md: 8 }} display={{ base: "none", sm: "table-cell" }}>
                      Details
                    </Table.ColumnHeader>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {visible.map((tournament) => {
                  const href = `${ROUTES.TOURNAMENT}/${tournament.id}`;
                  return (
                    <Table.Row key={tournament.id} onClick={() => router.push(href)} cursor="pointer" bg="transparent">
                      <Table.Cell pl={{ base: 4, md: 8 }}>
                        <Link href={href} onClick={(event) => event.stopPropagation()}>
                          <Text fontWeight="semibold" color="ink" fontSize="md">
                            {tournament.name}
                          </Text>
                        </Link>
                        <Box display={{ base: "block", md: "none" }} mt={1} fontSize="sm" color="ink.muted">
                          <SurfaceDot surface={tournament.surface} indoor={tournament.indoor} />
                        </Box>
                      </Table.Cell>
                      <Table.Cell>
                        <LevelBadge level={tournament.tournamentType} />
                      </Table.Cell>
                      <Table.Cell display={{ base: "none", md: "table-cell" }}>
                        <SurfaceDot surface={tournament.surface} indoor={tournament.indoor} />
                      </Table.Cell>
                      {isAdmin && (
                        <Table.Cell pr={{ base: 4, md: 8 }} display={{ base: "none", sm: "table-cell" }}>
                          {hasTournamentDetails(tournament) ? (
                            <AddedPill>Details added</AddedPill>
                          ) : (
                            <Text as="span" fontWeight="semibold" textDecoration="underline" color="ink">
                              + Add details
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

export default TournamentsDirectory;
