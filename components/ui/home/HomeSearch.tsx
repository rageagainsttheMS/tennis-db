"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Input, Text, useBreakpointValue } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { getPlayers } from "@/lib/actions/player.actions";
import { getTournaments } from "@/lib/actions/tournament.actions";
import { displayName } from "@/lib/utils/utils";
import { ROUTES, SUGGESTED_PLAYERS } from "@/types/constants";
import { Segmented } from "../shared/Segmented";

type Mode = "players" | "tournaments";
type Suggestion = { id: string; label: string; href: string };

const PLACEHOLDER: Record<Mode, { short: string; long: string }> = {
  players: { short: "Search players", long: "Search players, e.g. Jannik Sinner" },
  tournaments: { short: "Search tournaments", long: "Search tournaments, e.g. Wimbledon" },
};

/** The home page search: players or tournaments, with suggestions as you type. */
const HomeSearch = () => {
  const router = useRouter();
  const listId = useId();
  const wide = useBreakpointValue({ base: false, md: true });
  const [mode, setMode] = useState<Mode>("players");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ key: string; items: Suggestion[] }>({ key: "", items: [] });
  const [open, setOpen] = useState(false);

  const trimmed = query.trim();
  const requestKey = `${mode}:${trimmed}`;

  useEffect(() => {
    if (!trimmed) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const items: Suggestion[] =
          mode === "players"
            ? (await getPlayers(trimmed)).slice(0, 8).map((player) => ({
                id: player.id,
                label: displayName(player),
                href: `${ROUTES.PLAYERPROFILE}/${player.id}`,
              }))
            : (await getTournaments(trimmed)).slice(0, 8).map((tournament) => ({
                id: tournament.id,
                label: tournament.name,
                href: `${ROUTES.TOURNAMENT}/${tournament.id}`,
              }));
        if (!cancelled) setResults({ key: requestKey, items });
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [mode, trimmed, requestKey]);

  const suggestions = trimmed && results.key === requestKey ? results.items : [];
  const listPage = mode === "players" ? ROUTES.PLAYERS : ROUTES.TOURNAMENTS;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (suggestions.length === 1) router.push(suggestions[0].href);
    else router.push(trimmed ? `${listPage}?q=${encodeURIComponent(trimmed)}` : listPage);
  };

  return (
    <Box w="100%" maxW="880px" mx="auto">
      <Box bg="card" borderRadius="2xl" p={{ base: 3, md: 4 }} boxShadow="0 24px 60px rgba(0,0,0,0.35)" position="relative" textAlign="left">
        <Box mb={3} display="inline-flex">
          <Segmented
            label="Search for"
            options={[
              { value: "players", label: "Players" },
              { value: "tournaments", label: "Tournaments" },
            ]}
            value={mode}
            onChange={(value) => {
              setMode(value);
              setOpen(true);
            }}
          />
        </Box>
        <Flex as="form" onSubmit={submit} align="center" gap={3} role="search">
          <Box color="ink.muted" pl={2} flexShrink={0}>
            <LuSearch size={22} />
          </Box>
          <Input
            aria-label={mode === "players" ? "Search players" : "Search tournaments"}
            aria-controls={listId}
            aria-autocomplete="list"
            placeholder={wide ? PLACEHOLDER[mode].long : PLACEHOLDER[mode].short}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            border="none"
            fontSize={{ base: "md", md: "xl" }}
            color="ink"
            px={1}
            h={{ base: "48px", md: "60px" }}
            _focusVisible={{ outline: "none", boxShadow: "none" }}
            _placeholder={{ color: "ink.muted" }}
          />
          <Button type="submit" bg="court.900" color="white" h={{ base: "48px", md: "60px" }} px={{ base: 4, md: 7 }} borderRadius="xl" fontSize="md" _hover={{ bg: "court.800" }}>
            Search
          </Button>
        </Flex>

        {open && suggestions.length > 0 && (
          <Box
            id={listId}
            role="listbox"
            position="absolute"
            left={0}
            right={0}
            top="calc(100% + 8px)"
            bg="card"
            borderRadius="xl"
            boxShadow="lg"
            zIndex={10}
            maxH="320px"
            overflowY="auto"
            py={2}
          >
            {suggestions.map((item) => (
              <Box
                key={item.id}
                role="option"
                aria-selected={false}
                px={5}
                py={3}
                color="ink"
                cursor="pointer"
                _hover={{ bg: "page" }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => router.push(item.href)}
              >
                {item.label}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Flex mt={6} gap={2} justify="center" align="center" wrap="wrap">
        <Text color="hero.muted" fontSize="sm" mr={1}>
          Try
        </Text>
        {SUGGESTED_PLAYERS.map((name) => (
          <Box
            as="button"
            key={name}
            onClick={() => router.push(`${ROUTES.PLAYERS}?q=${encodeURIComponent(name.split(" ").slice(-1)[0])}`)}
            px={4}
            py={1.5}
            borderRadius="full"
            borderWidth="1px"
            borderColor="whiteAlpha.300"
            color="hero.text"
            fontSize="sm"
            cursor="pointer"
            _hover={{ bg: "court.800" }}
          >
            {name}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default HomeSearch;
