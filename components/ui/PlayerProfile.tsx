"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, Button, Flex, Grid, GridItem, Heading, Image, Input, NativeSelect, Tabs, Text, Textarea } from "@chakra-ui/react";
import type { MatchWithPlayers, Player } from "@/types";
import { ADMINROLE, PLAYER_BACKHAND, PLAYER_HAND } from "@/types/constants";
import { updatePlayer } from "@/lib/actions/player.actions";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { latestRank, winLoss } from "@/lib/stats/match-stats";
import { displayName, formatBackhand, formatHand, formatMatchDate } from "@/lib/utils/utils";
import MatchesTable from "./MatchesTable";
import { ImageUpload } from "./shared/ImageUpload";
import { toaster } from "./toaster";

type BioForm = {
  fullName: string;
  nickName: string;
  hand: string;
  backHand: string;
  country: string;
  birthPlace: string;
  turnedPro: string;
  age: string;
  profile: string;
  image: string;
};

function toForm(player: Player): BioForm {
  return {
    fullName: player.fullName ?? "",
    nickName: player.nickName ?? "",
    hand: player.hand ?? "",
    backHand: player.backHand ?? "",
    country: player.country ?? "",
    birthPlace: player.birthPlace ?? "",
    turnedPro: player.turnedPro ?? "",
    age: player.age ?? "",
    profile: player.profile ?? "",
    image: player.image ?? "",
  };
}

const TEXT_FIELDS: { name: keyof BioForm; label: string; placeholder?: string }[] = [
  { name: "fullName", label: "Full name", placeholder: "e.g. Carlos Alcaraz" },
  { name: "nickName", label: "Nickname" },
  { name: "country", label: "Country" },
  { name: "birthPlace", label: "Birth place" },
  { name: "turnedPro", label: "Turned pro", placeholder: "Year, e.g. 2018" },
  { name: "age", label: "Age" },
];

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <GridItem bg="gray.50" p={3} borderRadius="md">
    <Text fontWeight="bold">{label}</Text>
    <Text>{value || "-"}</Text>
  </GridItem>
);

const PlayerProfile = ({ player, matches }: { player: Player; matches: MatchWithPlayers[] }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === ADMINROLE;
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<BioForm>(() => toForm(player));
  const [saving, setSaving] = useState(false);

  const { getPresignedUrl } = useImageUpload();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!player.image) return;
    getPresignedUrl(player.image)
      .then(setImageSrc)
      .catch((error) => console.error("Failed to get image URL:", error));
  }, [player.image, getPresignedUrl]);

  const rank = latestRank(matches, player.id);
  const record = winLoss(matches, player.id);
  const name = displayName(player);

  const update = (field: keyof BioForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const result = await updatePlayer(player.id, form);
    setSaving(false);
    toaster.create({ title: result.success ? "Saved" : "Error", description: result.message, duration: result.success ? 2000 : 5000 });
    if (result.success) {
      setEditMode(false);
      router.refresh();
    }
  };

  const handleCancel = () => {
    setForm(toForm(player));
    setEditMode(false);
  };

  return (
    <Box mx="auto" mt={10} maxW="1200px" px={4}>
      <Flex justify="space-between" align="center" mb={2} gap={4} wrap="wrap">
        <Box>
          <Heading as="h1" size="4xl">
            {name}
          </Heading>
          {player.fullName && (
            <Text color="gray.500" fontSize="sm">
              Listed as {player.name}
            </Text>
          )}
        </Box>
        {isAdmin && (
          <Flex gap={2}>
            {editMode ? (
              <>
                <Button colorPalette="green" size="sm" onClick={handleSave} loading={saving}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button colorPalette="blue" size="sm" onClick={() => setEditMode(true)}>
                Edit bio
              </Button>
            )}
          </Flex>
        )}
      </Flex>

      <Flex gap={6} mb={6} color="gray.700" wrap="wrap">
        <Text>
          <b>Ranking:</b> {rank ? `${rank.rank} (as of ${formatMatchDate(rank.asOf)})` : "-"}
        </Text>
        <Text>
          <b>Record since 2021:</b> {record.wins}–{record.losses}
        </Text>
      </Flex>

      <Tabs.Root defaultValue={editMode ? "overview" : "matches"} mb={8}>
        <Tabs.List>
          <Tabs.Trigger value="matches">Matches</Tabs.Trigger>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="matches">
          <MatchesTable matches={matches} playerId={player.id} />
        </Tabs.Content>

        <Tabs.Content value="overview">
          <Flex direction={{ base: "column", md: "row" }} gap={6} mb={6}>
            {editMode ? (
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Player image
                </Text>
                <ImageUpload folder="players" currentImage={form.image} onImageUploaded={(key) => update("image", key)} />
              </Box>
            ) : imageSrc ? (
              <Image
                src={imageSrc}
                alt={`${name} profile picture`}
                boxSize={{ base: "200px", md: "250px" }}
                objectFit="cover"
                borderRadius="lg"
                border="2px solid"
                borderColor="gray.200"
                shadow="md"
              />
            ) : null}
          </Flex>

          <Heading as="h2" size="md" mb={3}>
            Personal details
          </Heading>
          {editMode ? (
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={8}>
              {TEXT_FIELDS.map(({ name: field, label, placeholder }) => (
                <GridItem key={field}>
                  <Text fontWeight="bold" mb={1}>
                    {label}
                  </Text>
                  <Input size="sm" value={form[field]} placeholder={placeholder} onChange={(e) => update(field, e.target.value)} />
                </GridItem>
              ))}
              <GridItem>
                <Text fontWeight="bold" mb={1}>
                  Plays
                </Text>
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field aria-label="Plays" value={form.hand} onChange={(e) => update("hand", e.currentTarget.value)}>
                    <option value="">Not entered</option>
                    {PLAYER_HAND.map((hand) => (
                      <option key={hand.ID} value={hand.ID}>
                        {hand.TEXT}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold" mb={1}>
                  Backhand
                </Text>
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field aria-label="Backhand" value={form.backHand} onChange={(e) => update("backHand", e.currentTarget.value)}>
                    <option value="">Not entered</option>
                    {PLAYER_BACKHAND.map((backHand) => (
                      <option key={backHand.ID} value={backHand.ID}>
                        {backHand.TEXT}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </GridItem>
            </Grid>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={8}>
              <Detail label="Country" value={player.country} />
              <Detail label="Age" value={player.age} />
              <Detail label="Plays" value={player.hand ? formatHand(player.hand) : null} />
              <Detail label="Backhand" value={player.backHand ? formatBackhand(player.backHand) : null} />
              <Detail label="Nickname" value={player.nickName} />
              <Detail label="Birth place" value={player.birthPlace} />
              <Detail label="Turned pro" value={player.turnedPro} />
            </Grid>
          )}
        </Tabs.Content>

        <Tabs.Content value="profile">
          {editMode ? (
            <Textarea rows={10} value={form.profile} onChange={(e) => update("profile", e.target.value)} />
          ) : (
            <Text fontSize="md" color="gray.600" whiteSpace="pre-wrap">
              {player.profile || "No profile has been written for this player yet."}
            </Text>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default PlayerProfile;
