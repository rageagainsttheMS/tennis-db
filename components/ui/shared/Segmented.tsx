"use client";
import { Box, Flex } from "@chakra-ui/react";

/** A pill group of mutually exclusive options ("All / Wins / Losses"). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <Flex role="radiogroup" aria-label={label} bg="blackAlpha.50" borderRadius="lg" p={1} gap={1} flexShrink={0}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Box
            as="button"
            key={option.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            px={{ base: 3, md: 4 }}
            py={2}
            borderRadius="md"
            fontSize="sm"
            fontWeight="medium"
            bg={selected ? "court.900" : "transparent"}
            color={selected ? "white" : "ink"}
            cursor="pointer"
            whiteSpace="nowrap"
            _hover={selected ? undefined : { bg: "blackAlpha.100" }}
          >
            {option.label}
          </Box>
        );
      })}
    </Flex>
  );
}

/** A rounded filter chip that can be toggled ("Clay", "Indoor only"). */
export const Chip = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Box
    as="button"
    aria-pressed={selected}
    onClick={onClick}
    display="inline-flex"
    alignItems="center"
    gap={2}
    px={5}
    py={2.5}
    borderRadius="full"
    borderWidth="1px"
    borderColor={selected ? "court.900" : "line"}
    bg={selected ? "court.900" : "card"}
    color={selected ? "white" : "ink"}
    fontSize="sm"
    fontWeight="medium"
    cursor="pointer"
    whiteSpace="nowrap"
    _hover={selected ? undefined : { borderColor: "ink.muted" }}
  >
    {children}
  </Box>
);
