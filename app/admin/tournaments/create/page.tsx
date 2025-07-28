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
import { Toaster, toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { Tournament } from "@/types";
// You need to implement this action
import { createTournament } from "@/lib/actions/tournament.actions";

const TOURNAMENT_TYPES = [
  { label: "Grand Slam", value: "GS" },
  { label: "ATP Masters 1000", value: "ATPM1000" },
  { label: "ATP 500", value: "ATP500" },
  { label: "ATP 250", value: "ATP250" },
  { label: "Davis Cup", value: "DavisCup" },
  { label: "Laver Cup", value: "LaverCup" },
];

export default function CreateTournamentPage() {
  const [form, setForm] = useState<Tournament>({
    name: "",
    tournamentType: "",
    image: "",
    drawSize: 0,
  });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "drawSize" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <Box maxW="600px" mx="auto" mt={10} mb={10}>
      <Toaster />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const result = await createTournament(form);
            if (!result.success) {
              toaster.create({
                title: "Error",
                description: result.message,
                duration: 5000,
              });
            } else {
              router.push("/admin/tournaments");
            }
          });
        }}
      >
        <Field.Root required mb={4}>
          <Field.Label>Name</Field.Label>
          <Input name="name" value={form.name} onChange={handleChange} />
        </Field.Root>
        <Field.Root required mb={4}>
          <Field.Label>Tournament Type</Field.Label>
           <Select.Root
            variant={"subtle"}
            collection={TOURNAMENT_TYPES}
            value={[form.tournamentType]} // Use form state directly
            onValueChange={(details) => {
              const selectedValue = details.value[0];
              setForm((prev) => ({ ...prev, tournamentType: selectedValue }));
            }}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select tournament type" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {TOURNAMENT_TYPES.map((type) => (
                    <Select.Item item={type} key={type.value}>
                      {type.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Field.Root>
        <Field.Root required mb={4}>
          <Field.Label>Draw Size</Field.Label>
          <Input
            type="number"
            name="drawSize"
            value={form.drawSize}
            onChange={handleChange}
            min={2}
            max={256}
          />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Image URL</Field.Label>
          <Input name="image" value={form.image} onChange={handleChange} />
        </Field.Root>
        <Flex justify="flex-end" align="center">
          {isPending && <Spinner size="sm" mr={4} />}
          <Button colorScheme="green" type="submit" disabled={isPending}>
            Create Tournament
          </Button>
        </Flex>
      </form>
    </Box>
  )
}