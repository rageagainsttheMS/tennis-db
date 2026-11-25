"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, NativeSelect, Table, Text } from "@chakra-ui/react";
import type { MatchWithPlayers } from "@/types";
import { ROUTES, roundLabel } from "@/types/constants";
import { groupPlayerEvents } from "@/lib/stats/player-summary";
import { formatDateRange } from "@/lib/utils/display";
import { displayName, formatMatchDate } from "@/lib/utils/utils";
import { OutcomePill, ResultChip, SurfaceBadge } from "../shared/Badges";
import { Card } from "../shared/Layout";
import { Segmented } from "../shared/Segmented";

const EVENTS_PER_PAGE = 8;
type ResultFilter = "all" | "wins" | "losses";

/** A player's matches, grouped by event, with season and win/loss filters. */
const PlayerMatches = ({ matches, playerId }: { matches: MatchWithPlayers[]; playerId: string }) => {
  const router = useRouter();
  const seasons = useMemo(() => [...new Set(matches.map((match) => match.season))].sort((a, b) => b - a), [matches]);
  const events = useMemo(() => groupPlayerEvents(matches, playerId), [matches, playerId]);
  const [season, setSeason] = useState("all");
  const [result, setResult] = useState<ResultFilter>("all");
  const [shown, setShown] = useState(EVENTS_PER_PAGE);

  const keep = (match: MatchWithPlayers) =>
    result === "all" || (result === "wins" ? match.winnerId === playerId : match.loserId === playerId);

  // The outcome badge is from the whole event, even when the filter hides some of its matches.
  const filtered = events
    .filter((event) => season === "all" || event.season === Number(season))
    .map((event) => ({ ...event, matches: event.matches.filter(keep) }))
    .filter((event) => event.matches.length > 0);
  const matchCount = filtered.reduce((total, event) => total + event.matches.length, 0);

  if (matches.length === 0) {
    return (
      <Card p={8}>
        <Text color="ink.muted">No matches have been loaded for this player.</Text>
      </Card>
    );
  }

  return (
    <>
      <Card px={{ base: 4, md: 6 }} py={4} mb={6}>
        <Flex align="center" gap={4} wrap="wrap">
          <Flex align="center" gap={3}>
            <Text color="ink.muted" fontSize="sm">
              Season
            </Text>
            <NativeSelect.Root size="md" width="160px">
              <NativeSelect.Field
                aria-label="Season"
                value={season}
                onChange={(event) => {
                  setSeason(event.currentTarget.value);
                  setShown(EVENTS_PER_PAGE);
                }}
                borderColor="line"
                fontWeight="medium"
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
          </Flex>
          <Segmented
            label="Result"
            options={[
              { value: "all", label: "All" },
              { value: "wins", label: "Wins" },
              { value: "losses", label: "Losses" },
            ]}
            value={result}
            onChange={(value) => {
              setResult(value);
              setShown(EVENTS_PER_PAGE);
            }}
          />
          <Text ml="auto" color="ink.muted" fontSize="sm">
            {matchCount} {matchCount === 1 ? "match" : "matches"}
          </Text>
        </Flex>
      </Card>

      {filtered.length === 0 && (
        <Card p={8}>
          <Text color="ink.muted">No matches match these filters.</Text>
        </Card>
      )}

      {filtered.slice(0, shown).map((event) => (
        <Card key={event.key} mb={6} overflow="hidden">
          <Flex align="center" gap={3} px={{ base: 4, md: 7 }} py={5} wrap="wrap" borderBottomWidth="1px" borderColor="line">
            <Link href={`${ROUTES.TOURNAMENT}/${event.tournament.id}?season=${event.season}`}>
              <Text fontFamily="heading" fontWeight="bold" fontSize="2xl" color="ink" _hover={{ textDecoration: "underline" }}>
                {event.tournament.name}
              </Text>
            </Link>
            <SurfaceBadge surface={event.surface} indoor={event.indoor} />
            <Text color="ink.muted" fontSize="sm">
              {formatDateRange(event.start, event.end)}
            </Text>
            {event.outcome.label && (
              <Box ml="auto">
                <OutcomePill label={event.outcome.label} highlight={event.outcome.kind === "champion"} />
              </Box>
            )}
          </Flex>
          <Table.Root size="md" interactive>
            <Table.Header>
              <Table.Row bg="transparent">
                <Table.ColumnHeader color="ink.muted" fontWeight="medium" pl={{ base: 4, md: 7 }} display={{ base: "none", md: "table-cell" }}>
                  Date
                </Table.ColumnHeader>
                <Table.ColumnHeader color="ink.muted" fontWeight="medium" pl={{ base: 4, md: 3 }}>
                  Round
                </Table.ColumnHeader>
                <Table.ColumnHeader color="ink.muted" fontWeight="medium">
                  Opponent
                </Table.ColumnHeader>
                <Table.ColumnHeader color="ink.muted" fontWeight="medium">
                  Result
                </Table.ColumnHeader>
                <Table.ColumnHeader color="ink.muted" fontWeight="medium" pr={{ base: 4, md: 7 }}>
                  Score
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {event.matches.map((match) => {
                const won = match.winnerId === playerId;
                const opponent = won ? match.loser : match.winner;
                return (
                  <Table.Row key={match.id} onClick={() => router.push(`${ROUTES.MATCH}/${match.id}`)} cursor="pointer" bg="transparent">
                    <Table.Cell pl={{ base: 4, md: 7 }} whiteSpace="nowrap" color="ink.muted" display={{ base: "none", md: "table-cell" }}>
                      {formatMatchDate(match.playedAt)}
                    </Table.Cell>
                    <Table.Cell pl={{ base: 4, md: 3 }}>{roundLabel(match.round)}</Table.Cell>
                    <Table.Cell>
                      <Link href={`${ROUTES.PLAYERPROFILE}/${opponent.id}`} onClick={(click) => click.stopPropagation()}>
                        <Text as="span" fontWeight="semibold" textDecoration="underline" color="ink">
                          {displayName(opponent)}
                        </Text>
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <ResultChip won={won} />
                    </Table.Cell>
                    <Table.Cell pr={{ base: 4, md: 7 }} className="tabular" whiteSpace="nowrap" letterSpacing="0.04em">
                      {match.score}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Card>
      ))}

      {shown < filtered.length && (
        <Flex justify="center">
          <Button onClick={() => setShown(shown + EVENTS_PER_PAGE)} bg="court.900" color="white" size="lg" borderRadius="xl" px={8} _hover={{ bg: "court.800" }}>
            Load earlier matches
          </Button>
        </Flex>
      )}
    </>
  );
};

export default PlayerMatches;
