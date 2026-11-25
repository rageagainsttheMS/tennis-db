"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Field, Flex, Grid, Input, NativeSelect, Textarea } from "@chakra-ui/react";
import type { Player } from "@/types";
import { PLAYER_BACKHAND, PLAYER_HAND } from "@/types/constants";
import { updatePlayer } from "@/lib/actions/player.actions";
import { toDateInputValue } from "@/lib/utils/utils";
import { Card, SectionHeading } from "../shared/Layout";
import { ImageUpload } from "../shared/ImageUpload";
import { toaster } from "../toaster";

type BioForm = {
  fullName: string;
  nickName: string;
  hand: string;
  backHand: string;
  country: string;
  birthPlace: string;
  turnedPro: string;
  birthDate: string;
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
    birthDate: toDateInputValue(player.birthDate),
    profile: player.profile ?? "",
    image: player.image ?? "",
  };
}

const TEXT_FIELDS: { name: keyof BioForm; label: string; placeholder?: string; type?: "date"; helper?: string }[] = [
  { name: "fullName", label: "Full name", placeholder: "e.g. Carlos Alcaraz" },
  { name: "country", label: "Country", placeholder: "e.g. Spain" },
  { name: "birthDate", label: "Birth date", type: "date", helper: "The profile shows the age worked out from this." },
  { name: "birthPlace", label: "Birth place", placeholder: "e.g. Murcia, Spain" },
  { name: "turnedPro", label: "Turned pro", placeholder: "Year, e.g. 2018" },
  { name: "nickName", label: "Also known as", placeholder: "e.g. Carlitos, Charly", helper: "Separate names with commas." },
];

const SELECTS = [
  { name: "hand" as const, label: "Plays", options: PLAYER_HAND },
  { name: "backHand" as const, label: "Backhand", options: PLAYER_BACKHAND },
];

/** The admin's form for a player's bio. The source's name and ID can't be changed here. */
const PlayerBioEditor = ({ player, onDone }: { player: Player; onDone: () => void }) => {
  const router = useRouter();
  const [form, setForm] = useState<BioForm>(() => toForm(player));
  const [saving, setSaving] = useState(false);
  const update = (field: keyof BioForm, value: string) => setForm((previous) => ({ ...previous, [field]: value }));

  const save = async () => {
    setSaving(true);
    const result = await updatePlayer(player.id, form);
    setSaving(false);
    toaster.create({ title: result.success ? "Saved" : "Error", description: result.message, duration: result.success ? 2000 : 5000 });
    if (result.success) {
      onDone();
      router.refresh();
    }
  };

  return (
    <Card p={{ base: 5, md: 8 }}>
      <SectionHeading>Edit bio</SectionHeading>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5} mb={6}>
        {TEXT_FIELDS.map(({ name, label, placeholder, type, helper }) => (
          <Field.Root key={name}>
            <Field.Label>{label}</Field.Label>
            <Input type={type} value={form[name]} placeholder={placeholder} onChange={(event) => update(name, event.target.value)} bg="card" />
            {helper && <Field.HelperText>{helper}</Field.HelperText>}
          </Field.Root>
        ))}
        {SELECTS.map(({ name, label, options }) => (
          <Field.Root key={name}>
            <Field.Label>{label}</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field aria-label={label} value={form[name]} onChange={(event) => update(name, event.currentTarget.value)} bg="card">
                <option value="">Not entered</option>
                {options.map((option) => (
                  <option key={option.ID} value={option.ID}>
                    {option.TEXT}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
        ))}
      </Grid>
      <Field.Root mb={6}>
        <Field.Label>Profile</Field.Label>
        <Textarea rows={8} value={form.profile} onChange={(event) => update("profile", event.target.value)} bg="card" />
      </Field.Root>
      <Box mb={8}>
        <Field.Root>
          <Field.Label>Photo</Field.Label>
        </Field.Root>
        <Box mt={2}>
          <ImageUpload folder="players" currentImage={form.image} onImageUploaded={(key) => update("image", key)} />
        </Box>
      </Box>
      <Flex gap={3} justify="flex-end">
        <Button variant="outline" onClick={onDone} disabled={saving} borderRadius="lg">
          Cancel
        </Button>
        <Button onClick={save} loading={saving} bg="court.900" color="white" borderRadius="lg" _hover={{ bg: "court.800" }}>
          Save
        </Button>
      </Flex>
    </Card>
  );
};

export default PlayerBioEditor;
