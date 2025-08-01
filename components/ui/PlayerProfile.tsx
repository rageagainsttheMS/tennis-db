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
  Flex,
  Tabs,
  Button,
  Input,
  Textarea,
  Select,
  Image,
} from "@chakra-ui/react";
import { createListCollection } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { toaster } from "./toaster";
import MatchesTable from "./MatchesTable";
import { ImageUpload } from "./shared/ImageUpload";
import { useImageUpload } from "@/lib/hooks/useImageUpload";


const PlayerProfile = ({player, matches} : {player : PlayerWithID, matches: Match[]}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: player.name,
    nickName: player.nickName || "",
    age: player.age,
    country: player.country,
    hand: player.hand,
    backHand: player.backHand,
    rank: player.rank,
    profile: player.profile,
    image: player.image || "",
    birthPlace: player.birthPlace || "",
    turnedPro: player.turnedPro || "",
  });

  const { getPresignedUrl } = useImageUpload();
  const [imageSrc, setImageSrc] = useState<string | null>(player.image || null);

 useEffect(() => {
  const fetchImageUrl = async () => {
    try {
      const viewUrl = await getPresignedUrl(player.image);
      setImageSrc(viewUrl);
    } catch (error) {
      console.error('Failed to get image URL:', error);
    }
  }
  fetchImageUrl();
 }, [player.image, getPresignedUrl]);

 const onImageUploadSuccess = (url: string) => {
  const key = new URL(url).pathname.slice(1); // Remove leading slash
  setFormData(prev => ({ ...prev, image: key }));
};

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
        
        // Refresh the page to get updated data
        router.refresh();
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
      image: player.image || "",
      birthPlace: player.birthPlace || "",
      turnedPro: player.turnedPro || "",
      nickName: player.nickName || "",
    });
    setEditMode(false);
  };

  return (
    <Box mx="auto" mt={10} maxW="1200px">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h1" size="4xl">
          {player.name}
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
          <Flex direction={{ base: "column", md: "row" }} gap={6} mb={6}>
            {/* Player Image */}
            <Box>
              {editMode ? (
                <Box>
                  <Text fontWeight="bold" mb={2}>Player Image</Text>
                  <Box mb={4}>
                    <ImageUpload 
                      folder="players" 
                      currentImage={formData.image}
                      onImageUploaded={onImageUploadSuccess} 
                    />
                  </Box>
                </Box>
              ) : (
                <Box>
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={`${player.name} profile picture`}
                      boxSize={{ base: "200px", md: "250px" }}
                      objectFit="cover"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      shadow="md"
                    />
                  ) : (
                    <Box
                      boxSize={{ base: "200px", md: "250px" }}
                      bg="gray.100"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color="gray.500" textAlign="center">
                        No Image<br />Available
                      </Text>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Flex>
          
          <Heading as="h2" size="md" mb={3}>
            Personal details
          </Heading>
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={4}
            mb={8}
            templateRows={{ base: "repeat(9, 1fr)", md: "repeat(5, 1fr)" }}
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
            <GridItem bg="gray.50" p={3} borderRadius="md">
              <Text fontWeight="bold">Nickname</Text>
              {editMode ? (
                <Input
                  name="nickName"
                  value={formData.nickName}
                  onChange={handleInputChange}
                  size="sm"
                  bg="white"
                  placeholder="Enter nickname"
                />
              ) : (
                <Text>{player.nickName || "-"}</Text>
              )}
            </GridItem>
            <GridItem bg="gray.50" p={3} borderRadius="md">
              <Text fontWeight="bold">Birth Place</Text>
              {editMode ? (
                <Input
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleInputChange}
                  size="sm"
                  bg="white"
                  placeholder="Enter birth place"
                />
              ) : (
                <Text>{player.birthPlace || "-"}</Text>
              )}
            </GridItem>
            <GridItem bg="gray.50" p={3} borderRadius="md">
              <Text fontWeight="bold">Turned Pro</Text>
              {editMode ? (
                <Input
                  name="turnedPro"
                  type="number"
                  value={formData.turnedPro}
                  onChange={handleInputChange}
                  size="sm"
                  bg="white"
                  placeholder="Year (e.g., 2010)"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              ) : (
                <Text>{player.turnedPro || "-"}</Text>
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
          <MatchesTable matches={matches} playerMatchId={player.playerMatchId} />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}
 
export default PlayerProfile;