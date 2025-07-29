"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, Center, Heading, Input, Flex } from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";
import { getPlayers } from "@/lib/actions/player.actions";
import { getTournaments } from "@/lib/actions/tournament.actions";
import { PlayerWithID, Tournament } from "@/types";
import { ROUTES } from "@/types/constants";

export default function Home() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerWithID[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tournamentSearchQuery, setTournamentSearchQuery] = useState("");
  const [tournamentSearchResults, setTournamentSearchResults] = useState<Tournament[]>([]);
  const [showTournamentSuggestions, setShowTournamentSuggestions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push(ROUTES.SIGNIN);
    }
  }, [session, status, router]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      const search = async () => {
        try {
          const results = await getPlayers(searchQuery);
          setSearchResults(results.slice(0, 8));
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      };
      search();
    }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (tournamentSearchQuery.trim().length === 0) {
        setTournamentSearchResults([]);
        setShowTournamentSuggestions(false);
        return;
      }

      const search = async () => {
        try {
          const results = await getTournaments(tournamentSearchQuery);
          setTournamentSearchResults(results.slice(0, 8));
          setShowTournamentSuggestions(true);
        } catch (error) {
          console.error("Tournament search error:", error);
          setTournamentSearchResults([]);
        }
      };
      search();
    }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [tournamentSearchQuery]);

  const handlePlayerSelect = (playerId: string) => {
    setShowSuggestions(false);
    setSearchQuery("");
    router.push(`/profile/${playerId}`);
  };

  const handleTournamentSelect = (tournamentId: string) => {
    setShowTournamentSuggestions(false);
    setTournamentSearchQuery("");
    router.push(`/tournament/${tournamentId}`);
  };

  if (status === "loading") {
    return <Center minH="80vh">Loading...</Center>;
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <Center minH="80vh" flexDirection="column">
      <Heading mb={8} fontSize={{ base: "2xl", md: "3xl" }} textAlign="center">
        Search the ultimate tennis database
      </Heading>
      <Box w={{ base: "100%", sm: "480px" }}>
        <Tabs.Root defaultValue="players">
          <Tabs.List mb={4}>
            <Tabs.Trigger value="players">Players</Tabs.Trigger>
            <Tabs.Trigger value="tournaments">Tournaments</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="players">
            <Box position="relative">
              <Flex
                as="form"
                boxShadow="lg"
                borderRadius="full"
                bg="white"
                px={4}
                py={2}
                align="center"
              >
                <Input
                  placeholder="Search players..."
                  variant="subtle"
                  fontSize="lg"
                  _placeholder={{ color: "gray.400" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                />
              </Flex>
              {showSuggestions && searchResults.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={4}
                  right={4}
                  bg="white"
                  boxShadow="lg"
                  borderRadius="md"
                  zIndex={10}
                  maxH="300px"
                  overflowY="auto"
                >
                  {searchResults.map((player) => (
                    <Box
                      key={player.id}
                      px={4}
                      py={3}
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      onClick={() => handlePlayerSelect(player.id)}
                    >
                      <Box fontWeight="medium">{player.name}</Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Tabs.Content>
          <Tabs.Content value="tournaments">
            <Box position="relative">
              <Flex
                as="form"
                boxShadow="lg"
                borderRadius="full"
                bg="white"
                px={4}
                py={2}
                align="center"
              >
                <Input
                  placeholder="Search tournaments..."
                  variant="subtle"
                  fontSize="lg"
                  _placeholder={{ color: "gray.400" }}
                  value={tournamentSearchQuery}
                  onChange={(e) => setTournamentSearchQuery(e.target.value)}
                  onFocus={() => tournamentSearchQuery && setShowTournamentSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowTournamentSuggestions(false), 200)
                  }
                />
              </Flex>
              {showTournamentSuggestions && tournamentSearchResults.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={4}
                  right={4}
                  bg="white"
                  boxShadow="lg"
                  borderRadius="md"
                  zIndex={10}
                  maxH="300px"
                  overflowY="auto"
                >
                  {tournamentSearchResults.map((tournament) => (
                    <Box
                      key={tournament.id}
                      px={4}
                      py={3}
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      onClick={() => handleTournamentSelect(tournament.id)}
                    >
                      <Box fontWeight="medium">{tournament.name}</Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Center>
  );
}
