"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, Button, Field, Flex, Heading, Image, Input, NativeSelect, Tabs, Text, Textarea } from "@chakra-ui/react";
import { LuTrophy } from "react-icons/lu";
import type { MatchWithPlayers, Tournament } from "@/types";
import { ADMINROLE, ROUTES } from "@/types/constants";
import { updateTournament } from "@/lib/actions/tournament.actions";
import { findFinal } from "@/lib/stats/tournament-summary";
import { displayName, formatMatchDate } from "@/lib/utils/utils";
import { LevelBadge, SurfaceBadge } from "./shared/Badges";
import { Card, Container, CourtLines, Hero, SectionHeading } from "./shared/Layout";
import { useStoredImage } from "./shared/PlayerAvatar";
import { ImageUpload } from "./shared/ImageUpload";
import TournamentDraw from "./tournament/TournamentDraw";
import { toaster } from "./toaster";

type Tab = "matches" | "overview";

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

const TournamentEditor = ({ tournament, onDone }: { tournament: Tournament; onDone: () => void }) => {
  const router = useRouter();
  const [form, setForm] = useState({
    description: tournament.description ?? "",
    drawSize: tournament.drawSize ? String(tournament.drawSize) : "",
    image: tournament.image ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const result = await updateTournament(tournament.id, form);
    setSaving(false);
    toaster.create({ title: result.success ? "Saved" : "Error", description: result.message, duration: 4000 });
    if (result.success) {
      onDone();
      router.refresh();
    }
  };

  return (
    <Card p={{ base: 5, md: 8 }}>
      <SectionHeading>Edit details</SectionHeading>
      <Field.Root mb={5}>
        <Field.Label>Description</Field.Label>
        <Textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} bg="card" />
      </Field.Root>
      <Field.Root mb={5} maxW="240px">
        <Field.Label>Draw size</Field.Label>
        <Input type="number" min={2} max={256} value={form.drawSize} onChange={(e) => setForm({ ...form, drawSize: e.target.value })} bg="card" />
      </Field.Root>
      <Field.Root mb={8}>
        <Field.Label>Image</Field.Label>
        <ImageUpload folder="tournaments" currentImage={form.image} onImageUploaded={(key) => setForm({ ...form, image: key })} />
      </Field.Root>
      <Flex gap={3} justify="flex-end">
        <Button variant="outline" onClick={onDone} disabled={saving} borderRadius="lg">
          Cancel
        </Button>
        <Button onClick={save} loading={saving} bg="court.900" color="white" borderRadius="lg" _hover={{ bg: "court.800" }}>
          Save
        </Button>
      </Flex>
    </Card>
  );
};

const TournamentOverview = ({ tournament }: { tournament: Tournament }) => {
  const image = useStoredImage(tournament.image);
  return (
    <Card p={{ base: 5, md: 8 }}>
      <Flex direction={{ base: "column", md: "row" }} gap={8}>
        {image && <Image src={image} alt={tournament.name} w={{ base: "100%", md: "360px" }} objectFit="cover" borderRadius="xl" flexShrink={0} />}
        <Box>
          <Text fontSize="lg" lineHeight="1.7" color={tournament.description ? "ink" : "ink.muted"} whiteSpace="pre-wrap">
            {tournament.description || "No description has been written for this tournament yet."}
          </Text>
          {tournament.drawSize && (
            <Text mt={6} color="ink.muted">
              Draw of {tournament.drawSize}
            </Text>
          )}
        </Box>
      </Flex>
    </Card>
  );
};

const TournamentDetails = ({
  tournament,
  matches,
  seasons,
  season,
}: {
  tournament: Tournament;
  matches: MatchWithPlayers[];
  seasons: number[];
  season: number | null;
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === ADMINROLE;
  const [tab, setTab] = useState<Tab>("matches");
  const [editing, setEditing] = useState(false);
  const final = findFinal(matches);

  return (
    <Tabs.Root value={tab} onValueChange={(details) => setTab(details.value as Tab)} variant="plain" lazyMount>
      <Hero>
        <CourtLines display={{ base: "none", lg: "block" }} top="20px" right="-120px" w="520px" h="440px" />
        <Container pt={{ base: 8, md: 12 }} position="relative">
          <Flex justify="space-between" align={{ base: "flex-start", lg: "center" }} gap={6} direction={{ base: "column", lg: "row" }} mb={{ base: 6, md: 8 }}>
            <Box flex="1" minW={0} maxW="760px" w="100%">
              <Flex gap={2} mb={4} wrap="wrap">
                <LevelBadge level={tournament.tournamentType} variant="hero" />
                <SurfaceBadge surface={tournament.surface} indoor={tournament.indoor} size="md" />
              </Flex>
              <Heading as="h1" fontFamily="heading" fontWeight="bold" fontSize={{ base: "4xl", md: "7xl" }} lineHeight="1.05" letterSpacing="-0.01em" mb={{ base: 6, md: 8 }}>
                {tournament.name}
              </Heading>

              {final && season !== null && (
                <Flex
                  bg="court.800"
                  borderWidth="1px"
                  borderColor="hero.line"
                  borderRadius="2xl"
                  px={{ base: 4, md: 7 }}
                  py={5}
                  align="center"
                  gap={{ base: 4, md: 6 }}
                  wrap="wrap"
                >
                  <Flex boxSize={{ base: "48px", md: "64px" }} borderRadius="xl" bg="ball.500" color="court.900" align="center" justify="center" flexShrink={0}>
                    <LuTrophy size={26} />
                  </Flex>
                  <Box flex="1" minW="160px">
                    <Text color="hero.muted" fontSize="sm">
                      {season} champion
                    </Text>
                    <Link href={`${ROUTES.PLAYERPROFILE}/${final.winner.id}`}>
                      <Text fontFamily="heading" fontWeight="bold" fontSize={{ base: "2xl", md: "3xl" }} textDecoration="underline" textUnderlineOffset="4px">
                        {displayName(final.winner)}
                      </Text>
                    </Link>
                  </Box>
                  <Box textAlign={{ base: "left", md: "right" }}>
                    <Text color="hero.muted" fontSize="sm">
                      Final · {formatMatchDate(final.playedAt)}
                    </Text>
                    <Text fontWeight="semibold" fontSize={{ base: "md", md: "lg" }} className="tabular">
                      d. {displayName(final.loser)} · {final.score}
                    </Text>
                  </Box>
                </Flex>
              )}
            </Box>

            <Flex align="center" gap={3}>
              {seasons.length > 0 && season !== null && (
                <>
                  <Text color="hero.muted">Year</Text>
                  <NativeSelect.Root size="lg" width="130px">
                    <NativeSelect.Field
                      aria-label="Year"
                      value={season}
                      onChange={(event) => router.push(`${ROUTES.TOURNAMENT}/${tournament.id}?season=${event.currentTarget.value}`)}
                      bg="card"
                      color="ink"
                      fontWeight="semibold"
                      borderRadius="xl"
                    >
                      {seasons.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator color="ink" />
                  </NativeSelect.Root>
                </>
              )}
              {isAdmin && !editing && (
                <Button
                  onClick={() => {
                    setEditing(true);
                    setTab("overview");
                  }}
                  variant="outline"
                  color="hero.text"
                  borderColor="whiteAlpha.400"
                  borderRadius="xl"
                  size="lg"
                  _hover={{ bg: "court.800" }}
                >
                  Edit
                </Button>
              )}
            </Flex>
          </Flex>

          <Tabs.List gap={{ base: 0, md: 2 }} borderBottomWidth={0}>
            <Tabs.Trigger value="matches" {...TAB_STYLE}>
              Matches
            </Tabs.Trigger>
            <Tabs.Trigger value="overview" {...TAB_STYLE}>
              Overview
            </Tabs.Trigger>
          </Tabs.List>
        </Container>
      </Hero>

      <Container pt={{ base: 8, md: 10 }}>
        <Tabs.Content value="matches" p={0}>
          {season === null || matches.length === 0 ? (
            <Card p={8}>
              <Text color="ink.muted">No matches have been loaded for this tournament.</Text>
            </Card>
          ) : (
            <TournamentDraw key={season} matches={matches} />
          )}
        </Tabs.Content>
        <Tabs.Content value="overview" p={0}>
          {editing ? <TournamentEditor tournament={tournament} onDone={() => setEditing(false)} /> : <TournamentOverview tournament={tournament} />}
        </Tabs.Content>
      </Container>
    </Tabs.Root>
  );
};

export default TournamentDetails;
