"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge, Box, Button, Field, Flex, Heading, Input, NativeSelect, Table, Tabs, Text, Textarea } from "@chakra-ui/react";
import type { MatchWithPlayers, Tournament } from "@/types";
import { ADMINROLE, ROUND_TYPES, roundLabel, tournamentTypeLabel } from "@/types/constants";
import { updateTournament } from "@/lib/actions/tournament.actions";
import { displayName, formatMatchDate } from "@/lib/utils/utils";
import { ImageUpload } from "./shared/ImageUpload";
import { toaster } from "./toaster";

const ROUND_ORDER: string[] = ROUND_TYPES.map((round) => round.value);

/** Matches grouped by round, final first, in the order of `ROUND_TYPES`. */
function groupByRound(matches: MatchWithPlayers[]) {
  const groups = new Map<string, MatchWithPlayers[]>();
  for (const match of matches) groups.set(match.round, [...(groups.get(match.round) ?? []), match]);
  return [...groups.entries()].sort(([a], [b]) => ROUND_ORDER.indexOf(a) - ROUND_ORDER.indexOf(b));
}

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
    <Box borderWidth={1} borderRadius="md" p={4} mb={6}>
      <Field.Root mb={4}>
        <Field.Label>Description</Field.Label>
        <Textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field.Root>
      <Field.Root mb={4}>
        <Field.Label>Draw size</Field.Label>
        <Input type="number" min={2} max={256} value={form.drawSize} onChange={(e) => setForm({ ...form, drawSize: e.target.value })} />
      </Field.Root>
      <Field.Root mb={4}>
        <Field.Label>Image</Field.Label>
        <ImageUpload folder="tournaments" currentImage={form.image} onImageUploaded={(key) => setForm({ ...form, image: key })} />
      </Field.Root>
      <Flex gap={2} justify="flex-end">
        <Button variant="outline" size="sm" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button colorPalette="green" size="sm" onClick={save} loading={saving}>
          Save
        </Button>
      </Flex>
    </Box>
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
  const [editing, setEditing] = useState(false);

  return (
    <Box mx="auto" mt={10} maxW="1200px" px={4}>
      <Flex justify="space-between" align="center" mb={4} gap={4} wrap="wrap">
        <Heading as="h1" size="4xl">
          {tournament.name}
        </Heading>
        {isAdmin && !editing && (
          <Button colorPalette="blue" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </Flex>

      <Flex align="center" mb={6} gap={3} wrap="wrap">
        <Badge colorPalette="green" fontSize="1em">
          {tournamentTypeLabel(tournament.tournamentType)}
        </Badge>
        {tournament.surface && (
          <Badge colorPalette="green" fontSize="1em">
            {tournament.surface}
            {tournament.indoor ? " (indoor)" : ""}
          </Badge>
        )}
        {tournament.drawSize && (
          <Badge colorPalette="gray" fontSize="1em">
            Draw of {tournament.drawSize}
          </Badge>
        )}
      </Flex>

      {editing && <TournamentEditor tournament={tournament} onDone={() => setEditing(false)} />}

      <Tabs.Root defaultValue="matches" mb={8}>
        <Tabs.List>
          <Tabs.Trigger value="matches">Matches</Tabs.Trigger>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview">
          <Text fontSize="md">{tournament.description || "No description available"}</Text>
        </Tabs.Content>
        <Tabs.Content value="matches">
          {seasons.length === 0 || season === null ? (
            <Text mt={8} color="gray.500">
              No matches have been loaded for this tournament.
            </Text>
          ) : (
            <Box mt={4}>
              <Flex justify="space-between" align="center" mb={4}>
                <NativeSelect.Root size="sm" width="140px">
                  <NativeSelect.Field
                    aria-label="Season"
                    value={season}
                    onChange={(event) => router.push(`/tournament/${tournament.id}?season=${event.currentTarget.value}`)}
                  >
                    {seasons.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Text fontSize="sm" color="gray.600">
                  {matches.length} matches
                </Text>
              </Flex>

              {groupByRound(matches).map(([round, roundMatches]) => (
                <Box key={round} mb={6}>
                  <Heading as="h3" size="md" mb={2}>
                    {roundLabel(round)}
                  </Heading>
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Date</Table.ColumnHeader>
                        <Table.ColumnHeader>Winner</Table.ColumnHeader>
                        <Table.ColumnHeader>Loser</Table.ColumnHeader>
                        <Table.ColumnHeader>Score</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {roundMatches.map((match) => (
                        <Table.Row
                          key={match.id}
                          onClick={() => router.push(`/match/${match.id}`)}
                          _hover={{ bg: "gray.100", cursor: "pointer" }}
                        >
                          <Table.Cell whiteSpace="nowrap">{formatMatchDate(match.playedAt)}</Table.Cell>
                          <Table.Cell fontWeight="semibold">{displayName(match.winner)}</Table.Cell>
                          <Table.Cell>{displayName(match.loser)}</Table.Cell>
                          <Table.Cell>
                            {match.score}
                            {match.tournamentDetail && match.round === "TIE" ? ` · ${match.tournamentDetail}` : ""}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              ))}
            </Box>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default TournamentDetails;
