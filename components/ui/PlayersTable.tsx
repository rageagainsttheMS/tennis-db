"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Box, Input, Table, Text } from "@chakra-ui/react";
import type { Player } from "@/types";
import { displayName } from "@/lib/utils/utils";

function hasBio(player: Player) {
  return Boolean(player.fullName || player.profile || player.image || player.country);
}

/** Admin list of every player. Players come from the match data; open one to edit their bio. */
const PlayersTable = ({ players }: { players: Player[] }) => {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const query = filter.trim().toLowerCase();
  const visible = query
    ? players.filter((player) => player.name.toLowerCase().includes(query) || player.fullName?.toLowerCase().includes(query))
    : players;

  return (
    <Box mx="auto" maxW="1000px" mt={8} px={4}>
      <Text color="gray.600" mb={4}>
        Players are created from the match data. Open a player to add or edit their bio.
      </Text>
      <Input mb={4} placeholder="Filter players..." value={filter} onChange={(e) => setFilter(e.target.value)} />
      <Text fontSize="sm" color="gray.600" mb={2}>
        {visible.length} of {players.length} players · {players.filter(hasBio).length} with a bio
      </Text>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Listed as</Table.ColumnHeader>
            <Table.ColumnHeader>Bio</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visible.map((player) => (
            <Table.Row key={player.id} onClick={() => router.push(`/profile/${player.id}`)} _hover={{ bg: "gray.100", cursor: "pointer" }}>
              <Table.Cell>{displayName(player)}</Table.Cell>
              <Table.Cell color="gray.600">{player.name}</Table.Cell>
              <Table.Cell>{hasBio(player) ? <Badge colorPalette="green">Entered</Badge> : "-"}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default PlayersTable;
