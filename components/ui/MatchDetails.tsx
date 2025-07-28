"use client";

import { Match } from "@/types";
import { ROUND_TYPES } from "@/types/constants";
import {
  Box,
  Heading,
  Text,
  Grid,
  Flex,
  Avatar,
  Card,
  Separator,
} from "@chakra-ui/react";

interface MatchDetailsProps {
  match: Match;
}

const MatchDetails = ({ match }: MatchDetailsProps) => {
  // Parse the match statistics
  const winnerStats = {
    aces: match.winnerAces || 0,
    doubleFaults: match.winnerDoubleFaults || 0,
    firstServePercentage: match.winner1stServeIn && match.winnerServicePointsPlayed 
      ? Math.round((match.winner1stServeIn / match.winnerServicePointsPlayed) * 100) 
      : 0,
    firstServeWinPercentage: match.winner1stServeIn && match.winner1stServeWon
      ? Math.round((match.winner1stServeWon / match.winner1stServeIn) * 100)
      : 0,
    secondServeWinPercentage: match.winner1stServeIn && match.winnerServicePointsPlayed && match.winner2ndServeWon
      ? Math.round((match.winner2ndServeWon / (match.winnerServicePointsPlayed - match.winner1stServeIn)) * 100)
      : 0,
    breakPoints: `${match.winnerBreakPointSaved || 0}/${match.winnerBreakPointFaced || 0}`,
    serviceGames: match.winnerServeGames || 0,
    totalPoints: (match.winner1stServeWon || 0) + (match.winner2ndServeWon || 0),
  };

  const loserStats = {
    aces: match.loserAces || 0,
    doubleFaults: match.loserDoubleFaults || 0,
    firstServePercentage: match.loser1stServeIn && match.loserServicePointsPlayed 
      ? Math.round((match.loser1stServeIn / match.loserServicePointsPlayed) * 100) 
      : 0,
    firstServeWinPercentage: match.loser1stServeIn && match.loser1stServeWon
      ? Math.round((match.loser1stServeWon / match.loser1stServeIn) * 100)
      : 0,
    secondServeWinPercentage: match.loser1stServeIn && match.loserServicePointsPlayed && match.loser2ndServeWon
      ? Math.round((match.loser2ndServeWon / (match.loserServicePointsPlayed - match.loser1stServeIn)) * 100)
      : 0,
    breakPoints: `${match.loserBreakPointSaved || 0}/${match.loserBreakPointFaced || 0}`,
    serviceGames: match.loserServeGames || 0,
    totalPoints: (match.loser1stServeWon || 0) + (match.loser2ndServeWon || 0),
  };

  const StatRow = ({ label, winnerValue, loserValue }: { label: string; winnerValue: string | number; loserValue: string | number }) => (
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

  return (
    <Box maxW="1000px" mx="auto" mt={10} p={6}>
      {/* Match Header */}
      <Card.Root mb={6}>
        <Card.Header>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex direction="column" justify="space-between">
              <Text fontWeight="bold" fontSize="lg" mb={1}>
                {match.tourneyName}
              </Text>
              <Text fontSize="sm">
                {match.surface}
              </Text>
            </Flex>
            <Text fontWeight="bold" fontSize="md" color="gray.700" mb={1}>
              {ROUND_TYPES.find(round => round.value === match.round)?.label}
            </Text>
          </Flex>
          
          {/* Players and Score */}
          <Grid templateColumns="1fr auto 1fr" gap={6} alignItems="center">
            {/* Winner */}
            <Flex align="center" justify="flex-end">
              <Box textAlign="right" mr={4}>
                <Heading size="lg" color="green.600">{match.winnerName}</Heading>
                <Text fontSize="sm" color="gray.600">{match.winnerCountry}</Text>
                {match.winnerRank && (
                  <Text fontSize="sm" color="gray.500">Rank: {match.winnerRank}</Text>
                )}
              </Box>
              <Avatar.Root 
                size="xl" 
                bg="green.500"
              >
                <Avatar.Fallback>{match.winnerName.charAt(0)}</Avatar.Fallback>
              </Avatar.Root>
            </Flex>

            {/* Score */}
            <Box textAlign="center">
              <Heading size="2xl" mb={2}>{match.score || "6-4, 6-2"}</Heading>
              <Text fontSize="sm" color="gray.600">
                {match.bestOf === 3 ? "Best of 3" : "Best of 5"}
              </Text>
              {match.minutes && (
                <Text fontSize="sm" color="gray.500">
                  {Math.floor(match.minutes / 60)}h {match.minutes % 60}m
                </Text>
              )}
            </Box>

            {/* Loser */}
            <Flex align="center">
              <Avatar.Root 
                size="xl" 
                bg="red.500"
              >
                <Avatar.Fallback>{match.loserName?.charAt(0) || "L"}</Avatar.Fallback>
              </Avatar.Root>
              <Box textAlign="left" ml={4}>
                <Heading size="lg" color="red.600">{match.loserName}</Heading>
                <Text fontSize="sm" color="gray.600">{match.loserCountry}</Text>
                {match.loserRank && (
                  <Text fontSize="sm" color="gray.500">Rank: {match.loserRank}</Text>
                )}
              </Box>
            </Flex>
          </Grid>
        </Card.Header>
      </Card.Root>

      {/* Match Statistics */}
      <Card.Root>
        <Card.Header>
          <Heading size="md" textAlign="center" mb={4}>Match Statistics</Heading>
        </Card.Header>
        <Card.Body>
          <Box>
            <StatRow 
              label="Aces" 
              winnerValue={winnerStats.aces} 
              loserValue={loserStats.aces} 
            />
            <Separator />
            
            <StatRow 
              label="Double faults" 
              winnerValue={winnerStats.doubleFaults} 
              loserValue={loserStats.doubleFaults} 
            />
            <Separator />
            
            <StatRow 
              label="First serve %" 
              winnerValue={`${winnerStats.firstServePercentage}%`} 
              loserValue={`${loserStats.firstServePercentage}%`} 
            />
            <Separator />
            
            <StatRow 
              label="Win % on 1st serve" 
              winnerValue={`${winnerStats.firstServeWinPercentage}%`} 
              loserValue={`${loserStats.firstServeWinPercentage}%`} 
            />
            <Separator />
            
            <StatRow 
              label="Win % on 2nd serve" 
              winnerValue={`${winnerStats.secondServeWinPercentage}%`} 
              loserValue={`${loserStats.secondServeWinPercentage}%`} 
            />
            <Separator />
            
            <StatRow 
              label="Break points" 
              winnerValue={winnerStats.breakPoints} 
              loserValue={loserStats.breakPoints} 
            />
            <Separator />
            
            <StatRow 
              label="Service games won" 
              winnerValue={winnerStats.serviceGames} 
              loserValue={loserStats.serviceGames} 
            />
            <Separator />
            
            <StatRow 
              label="Total points won" 
              winnerValue={winnerStats.totalPoints} 
              loserValue={loserStats.totalPoints} 
            />
          </Box>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default MatchDetails;
