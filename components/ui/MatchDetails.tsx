"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, Badge, Box, Card, Flex, Grid, Heading, Image, Separator, Text } from "@chakra-ui/react";
import type { MatchWithPlayers, PlayerSummary } from "@/types";
import { MATCH_STATUS_LABELS, roundLabel } from "@/types/constants";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { getStatRows } from "@/lib/stats/match-stats";
import { displayName, formatMatchDate } from "@/lib/utils/utils";

interface MatchDetailsProps {
  match: MatchWithPlayers;
}

const StatRow = ({ label, winnerValue, loserValue }: { label: string; winnerValue: string; loserValue: string }) => (
  <Grid templateColumns="1fr 2fr 1fr" gap={4} py={3} alignItems="center">
    <Text textAlign="right" fontWeight="semibold" color="green.600">
      {winnerValue}
    </Text>
    <Text textAlign="center" color="gray.600" fontSize="sm">
      {label}
    </Text>
    <Text textAlign="left" fontWeight="semibold" color="red.600">
      {loserValue}
    </Text>
  </Grid>
);

function usePlayerImage(player: PlayerSummary) {
  const { getPresignedUrl } = useImageUpload();
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!player.image) return;
    getPresignedUrl(player.image)
      .then(setSrc)
      .catch((error) => console.error("Failed to fetch player image:", error));
  }, [player.image, getPresignedUrl]);

  return src;
}

const PlayerHeading = ({
  player,
  rank,
  won,
}: {
  player: PlayerSummary;
  rank: number | null;
  won: boolean;
}) => {
  const image = usePlayerImage(player);
  const name = displayName(player);
  const colour = won ? "green" : "red";

  const avatar = image ? (
    <Image
      src={image}
      alt={`${name} profile picture`}
      boxSize="80px"
      borderRadius="full"
      objectFit="cover"
      border="3px solid"
      borderColor={`${colour}.500`}
    />
  ) : (
    <Avatar.Root size="xl" bg={`${colour}.500`}>
      <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
    </Avatar.Root>
  );

  const details = (
    <Box textAlign={won ? "right" : "left"} mx={4}>
      <Link href={`/profile/${player.id}`}>
        <Heading size="lg" color={`${colour}.600`} _hover={{ textDecoration: "underline" }}>
          {name}
        </Heading>
      </Link>
      {rank !== null && (
        <Text fontSize="sm" color="gray.500">
          Rank: {rank}
        </Text>
      )}
    </Box>
  );

  return (
    <Flex align="center" justify={won ? "flex-end" : "flex-start"}>
      {won ? (
        <>
          {details}
          {avatar}
        </>
      ) : (
        <>
          {avatar}
          {details}
        </>
      )}
    </Flex>
  );
};

const MatchDetails = ({ match }: MatchDetailsProps) => {
  const stats = getStatRows(match);
  const statusLabel = MATCH_STATUS_LABELS[match.status];
  const venue = [match.surface, match.indoor ? "Indoor" : null].filter(Boolean).join(" · ");

  return (
    <Box maxW="1000px" mx="auto" mt={10} p={6}>
      <Card.Root mb={6}>
        <Card.Header>
          <Flex justify="space-between" align="flex-start" mb={4} gap={4}>
            <Flex direction="column">
              <Link href={`/tournament/${match.tournament.id}?season=${match.season}`}>
                <Text fontWeight="bold" fontSize="lg" mb={1} _hover={{ textDecoration: "underline" }}>
                  {match.tournament.name} {match.season}
                </Text>
              </Link>
              <Text fontSize="sm" color="gray.600">
                {[formatMatchDate(match.playedAt), venue, match.tournamentDetail].filter(Boolean).join(" · ")}
              </Text>
            </Flex>
            <Flex direction="column" align="flex-end" gap={1}>
              <Text fontWeight="bold" fontSize="md" color="gray.700">
                {roundLabel(match.round)}
              </Text>
              {statusLabel && <Badge colorPalette="orange">{statusLabel}</Badge>}
            </Flex>
          </Flex>

          <Grid templateColumns="1fr auto 1fr" gap={6} alignItems="center">
            <PlayerHeading player={match.winner} rank={match.winnerRank} won />
            <Box textAlign="center">
              <Heading size="2xl" mb={2}>
                {match.score}
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Best of {match.bestOf}
              </Text>
            </Box>
            <PlayerHeading player={match.loser} rank={match.loserRank} won={false} />
          </Grid>
        </Card.Header>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="md" textAlign="center" mb={4}>
            Match Statistics
          </Heading>
        </Card.Header>
        <Card.Body>
          {stats.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              No statistics are available for this match.
            </Text>
          ) : (
            stats.map((row, index) => (
              <Box key={row.label}>
                {index > 0 && <Separator />}
                <StatRow label={row.label} winnerValue={row.winner} loserValue={row.loser} />
              </Box>
            ))
          )}
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default MatchDetails;
