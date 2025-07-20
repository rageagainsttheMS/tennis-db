"use client";

import { updatePlayer } from "@/lib/actions/player.actions";
import { formatBackhand, formatHand } from "@/lib/utils/utils";
import { Match, PlayerWithID } from "@/types";
import { ADMINROLE, PLAYER_BACKHAND, PLAYER_HAND } from "@/types/constants";
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  Badge,
  Flex,
  Tabs,
  Button,
  Input,
  Textarea,
  Select,
} from "@chakra-ui/react";
import { createListCollection } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toaster } from "./toaster";

const PlayerProfile = ({player, matches} : {player : PlayerWithID, matches: Match[]}) => {
  const { data: session } = useSession();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: player.name,
    age: player.age,
    country: player.country,
    hand: player.hand,
    backHand: player.backHand,
    rank: player.rank,
    profile: player.profile,
    image : player.image || "",
  });

  console.log(matches);

  const isAdmin = session?.user?.role === ADMINROLE;

  const handCollection = createListCollection({
    items: PLAYER_HAND.map((hand) => ({
      label: hand.TEXT,
      value: hand.ID,
    })),
  });

  const bhCollection = createListCollection({
    items: PLAYER_BACKHAND.map((hand) => ({
      label: hand.TEXT,
      value: hand.ID,
    })),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rank' ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    const result = await updatePlayer(player.id, formData)
     if (!result.success) {
        toaster.create({
            title: "Error",
            description: result.message,
            duration: 5000
       });
    } else {
        toaster.create({
            title: "Success",
            description : result.message,
            duration: 2000
        });
    }

    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      name: player.name,
      age: player.age,
      country: player.country,
      hand: player.hand,
      backHand: player.backHand,
      rank: player.rank,
      profile: player.profile,
      image : player.image || "",
    });
    setEditMode(false);
  };

  return (
    <Box mx="auto" mt={10} maxW="1200px">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h1" size="4xl">
          {editMode ? (
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fontSize="4xl"
              fontWeight="bold"
              border="none"
              p={0}
              _focus={{ boxShadow: "none", borderColor: "blue.500" }}
            />
          ) : (
            player.name
          )}
        </Heading>
        {isAdmin && (
          <Box>
            {editMode ? (
              <Flex gap={2}>
                <Button colorScheme="green" size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </Flex>
            ) : (
              <Button colorScheme="blue" size="sm" onClick={() => setEditMode(true)}>
                Edit
              </Button>
            )}
          </Box>
        )}
      </Flex>
      
      <Tabs.Root defaultValue="overview" mb={8}>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          <Tabs.Trigger value="matches">Matches</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview">
          {/* Overview content */}
          <Flex align="center" mb={6} gap={4}>
            <Box>
              <Badge colorScheme="green" fontSize="1em" mb={2}>
                {editMode ? (
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    size="sm"
                    bg="white"
                  />
                ) : (
                  player.country
                )}
              </Badge>
            </Box>
          </Flex>
          <Heading as="h2" size="md" mb={3}>
            Personal details
          </Heading>
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={4}
            mb={8}
            templateRows={{ base: "repeat(6, 1fr)", md: "repeat(3, 1fr)" }}
          >
            <GridItem bg="gray.50" p={3} borderRadius="md">
              <Text fontWeight="bold">Age</Text>
              {editMode ? (
                <Input
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  size="sm"
                  bg="white"
                />
              ) : (
                <Text>{player.age}</Text>
              )}
            </GridItem>
            <GridItem bg="gray.50" p={3} borderRadius="md">
              <Text fontWeight="bold">Country</Text>
              {editMode ? (
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  size="sm"
                  bg="white"
                />
              ) : (
                <Text>{player.country}</Text>
              )}
            </GridItem>
            <GridItem bg="gray.50" p={3} borderRadius="md">
              <Text fontWeight="bold">Plays</Text>
              {editMode ? (
                <Select.Root
                  collection={handCollection}
                  value={[formData.hand]}
                  onValueChange={(details) => {
                    setFormData(prev => ({ ...prev, hand: details.value[0] }));
                  }}
                  size="sm"
                >
                  <Select.Trigger bg="white" />
                  <Select.Content>
                    {handCollection.items.map((hand) => (
                      <Select.Item item={hand} key={hand.value}>
                        {hand.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              ) : (
                <Text>{formatHand(player.hand)}</Text>
              )}
            </GridItem>
            <GridItem bg="gray.50" p={3} borderRadius="md">
              <Text fontWeight="bold">Backhand</Text>
              {editMode ? (
                <Select.Root
                  collection={bhCollection}
                  value={[formData.backHand]}
                  onValueChange={(details) => {
                    setFormData(prev => ({ ...prev, backHand: details.value[0] }));
                  }}
                  size="sm"
                >
                  <Select.Trigger bg="white" />
                  <Select.Content>
                    {bhCollection.items.map((backhand) => (
                      <Select.Item item={backhand} key={backhand.value}>
                        {backhand.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              ) : (
                <Text>{formatBackhand(player.backHand)}</Text>
              )}
            </GridItem>
            <GridItem bg="gray.50" p={3} borderRadius="md">
              <Text fontWeight="bold">Rank</Text>
              {editMode ? (
                <Input
                  name="rank"
                  type="number"
                  value={formData.rank}
                  onChange={handleInputChange}
                  size="sm"
                  bg="white"
                />
              ) : (
                <Text>{player.rank}</Text>
              )}
            </GridItem>
          </Grid>
        </Tabs.Content>
        <Tabs.Content value="profile">
          <Text fontSize="md" color="gray.500">
                {editMode ? (
                  <Textarea
                    name="profile"
                    value={formData.profile}
                    onChange={handleInputChange}
                    size="sm"
                    rows={10}
                    bg="white"
                  />
                ) : (
                  player.profile
                )}
              </Text>
        </Tabs.Content>
        <Tabs.Content value="matches">
          {/* Matches content */}
          <Text>Matches tab content coming soon.</Text>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}
 
export default PlayerProfile;