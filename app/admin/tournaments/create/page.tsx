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
import { createTournament } from "@/lib/actions/tournament.actions";
import { createListCollection } from "@chakra-ui/react";
import { TOURNAMENT_TYPES } from "@/types/constants";
const tournamentTypes = createListCollection({
  items: TOURNAMENT_TYPES,
});

export default function CreateTournamentPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    tournamentType: "GS",
    image: "",
    drawSize: 32,
  });
  
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "drawSize" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createTournament(form);
      if (!result.success) {
        toaster.create({
          title: "Error",
          description: result.message,
          status: "error",
          duration: 5000,
        });
      } else {
        toaster.create({
          title: "Success",
          description: "Tournament created successfully",
          status: "success",
          duration: 3000,
        });
        router.push("/admin/tournaments");
      }
    });
  };

  return (
    <Box maxW="800px" mx="auto" mt={10} mb={10}>
      <Toaster />
      <form onSubmit={handleSubmit}>
        <Field.Root required mb={4}>
          <Field.Label>Name</Field.Label>
          <Input 
            name="name" 
            value={form.name} 
            onChange={handleChange}
            placeholder="Enter tournament name"
          />
          <Field.ErrorText>Name is required</Field.ErrorText>
        </Field.Root>

        <Field.Root required mb={4}>
          <Field.Label>Tournament Type</Field.Label>
          <Select.Root
            collection={tournamentTypes}
            value={[form.tournamentType]}
            onValueChange={(details) => {
              const selectedValue = details.value[0];
              if (selectedValue) {
                setForm((prev) => ({ ...prev, tournamentType: selectedValue }));
              }
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
                  {tournamentTypes.items.map((type) => (
                    <Select.Item item={type} key={type.value}>
                      <Select.ItemText>{type.label}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
          <Field.ErrorText>Tournament type is required</Field.ErrorText>
        </Field.Root>

        <Field.Root required mb={4}>
          <Field.Label>Draw Size</Field.Label>
          <Input
            type="number"
            name="drawSize"
            value={form.drawSize.toString()}
            onChange={handleChange}
            min={2}
            max={256}
            placeholder="Enter draw size"
          />
          <Field.HelperText>Must be between 2 and 256</Field.HelperText>
          <Field.ErrorText>Draw size is required</Field.ErrorText>
        </Field.Root>

        <Field.Root mb={4}>
          <Field.Label>Image URL</Field.Label>
          <Input 
            name="image" 
            value={form.image} 
            onChange={handleChange}
            placeholder="Enter image URL (optional)"
          />
        </Field.Root>

        <Flex justify="flex-end" align="center" gap={4}>
          {isPending && <Spinner size="sm" />}
          <Button 
            colorScheme="green" 
            type="submit" 
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create Tournament"}
          </Button>
        </Flex>
      </form>
    </Box>
  );
}