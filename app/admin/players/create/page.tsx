"use client";

import {
  Box,
  Button,
  Flex,
  Input,
  Select,
  Textarea,
  Field,
  Portal,
  Spinner,
} from "@chakra-ui/react";
import { useState, useTransition } from "react";
import { PLAYER_BACKHAND, PLAYER_HAND } from "@/types/constants";
import { createListCollection } from "@chakra-ui/react";
import { createPlayer } from "@/lib/actions/player.actions";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/shared/ImageUpload";

export default function CreatePlayerPage() {

  const HAND_DEFAULT = "RIGHT";
  const BH_DEFAULT = "TWOHANDED";

  const [form, setForm] = useState({
    name: "",
    hand: HAND_DEFAULT,
    backHand: BH_DEFAULT,
    country: "",
    age: "",
    rank: 0,
    profile: "",
    image: "",
    birthPlace: "",
    turnedPro: "",
    playerMatchId: "",
    nickName: "",
  });
  const router = useRouter();

  // At the top of your component
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [isPending, startTransition] = useTransition();

    const onImageUploadSuccess = (url: string) => {
      const key = new URL(url).pathname.slice(1); // Remove leading slash
      setForm((prev) => ({ ...prev, image: key }));
  };


  return (
    <Box maxW="1000px" mx="auto" mt={10} mb={10}>
      <Toaster />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const result = await createPlayer(form);
            if (!result.success) {
              toaster.create({
                title: "Error",
                description: result.message,
                duration: 5000
              });
            } else {
              router.push("/admin/players");
            }
          
          });
        }}
      >
        <Field.Root required mb={4}>
          <Field.Label>Name</Field.Label>
          <Input name="name" value={form.name} onChange={handleChange} />
        </Field.Root>
        <Field.Root required mb={4}>
          <Field.Label>Hand</Field.Label>
          <Select.Root
            variant={"subtle"}
            collection={handCollection}
            value={[form.hand]} // Use form state directly
            onValueChange={(details) => {
              const selectedValue = details.value[0];
              setForm((prev) => ({ ...prev, hand: selectedValue }));
            }}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select hand" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {handCollection.items.map((hand) => (
                    <Select.Item item={hand} key={hand.value}>
                      {" "}
                      {/* Pass the full item object */}
                      {hand.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Field.Root>
        <Field.Root required mb={4}>
          <Field.Label>Backhand</Field.Label>
          <Select.Root
            variant={"subtle"}
            collection={bhCollection}
            value={[form.backHand]} // Use form state directly
            onValueChange={(details) => {
              const selectedValue = details.value[0];
              setForm((prev) => ({ ...prev, hand: selectedValue }));
            }}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select BH" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {handCollection.items.map((hand) => (
                    <Select.Item item={hand.label} key={hand.value}>
                      {hand.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Field.Root>
        <Field.Root required mb={4}>
          <Field.Label>Country</Field.Label>
          <Input name="country" value={form.country} onChange={handleChange} />
        </Field.Root>
        <Field.Root required mb={4}>
          <Field.Label>Age</Field.Label>
          <Input name="age" value={form.age} onChange={handleChange} />
        </Field.Root>
        <Field.Root required mb={4}>
          <Field.Label>Rank</Field.Label>
          <Input
            type="number"
            name="rank"
            value={form.rank}
            onChange={handleChange}
          />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Profile</Field.Label>
          <Textarea
            rows={10}
            name="profile"
            value={form.profile}
            onChange={handleChange}
          />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Image</Field.Label>
           <ImageUpload folder="players" key={form.image} onImageUploaded={onImageUploadSuccess} />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Birth Place</Field.Label>
          <Input name="birthPlace" value={form.birthPlace} onChange={handleChange} />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Turned Pro</Field.Label>
          <Input name="turnedPro" value={form.turnedPro} onChange={handleChange} />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Nickname</Field.Label>
           <Input name="nickName" value={form.nickName} onChange={handleChange}/>
        </Field.Root>
        <Flex justify="flex-end" align="center">
          {isPending && <Spinner size="sm" mr={4} />}
          <Button colorScheme="green" type="submit" disabled={isPending}>
            Create Player
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
