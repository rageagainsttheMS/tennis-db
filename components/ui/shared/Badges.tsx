import { Box, Flex, Text, type BoxProps } from "@chakra-ui/react";
import { surfaceKey, surfaceLabel } from "@/lib/utils/display";
import { tournamentTypeLabel } from "@/types/constants";

const SURFACE_COLOR = { hard: "surface.hard", clay: "surface.clay", grass: "surface.grass" } as const;

const Pill = (props: BoxProps) => (
  <Box as="span" display="inline-flex" alignItems="center" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="semibold" whiteSpace="nowrap" {...props} />
);

/** A filled pill in the surface's colour: "Hard", "Clay (indoor)". Nothing when there's no surface. */
export const SurfaceBadge = ({ surface, indoor = false, size = "sm" }: { surface: string | null | undefined; indoor?: boolean; size?: "sm" | "md" }) => {
  const key = surfaceKey(surface);
  if (!key) return null;
  return (
    <Pill bg={SURFACE_COLOR[key]} color="white" fontSize={size === "md" ? "sm" : "xs"} px={size === "md" ? 3 : 2.5} py={size === "md" ? 1 : 0.5}>
      {surfaceLabel(surface, indoor)}
    </Pill>
  );
};

/** A coloured dot (a square when indoor) and the surface name, for tables. */
export const SurfaceDot = ({ surface, indoor = false }: { surface: string | null | undefined; indoor?: boolean }) => {
  const key = surfaceKey(surface);
  if (!key) return <Text color="ink.muted">—</Text>;
  return (
    <Flex align="center" gap={2}>
      <Box boxSize="12px" borderRadius={indoor ? "3px" : "full"} bg={SURFACE_COLOR[key]} flexShrink={0} />
      <Text>{surfaceLabel(surface, indoor)}</Text>
    </Flex>
  );
};

const PROMINENT_LEVELS = new Set(["GS", "Finals"]);

/** The tournament level. Grand Slams and the Finals stand out. */
export const LevelBadge = ({ level, variant = "table" }: { level: string; variant?: "table" | "hero" }) => {
  if (variant === "hero") {
    return (
      <Pill bg="ball.500" color="court.900" fontSize="sm" px={3} py={1}>
        {tournamentTypeLabel(level)}
      </Pill>
    );
  }
  const prominent = PROMINENT_LEVELS.has(level);
  return (
    <Pill borderRadius="md" bg={prominent ? "court.900" : "blackAlpha.100"} color={prominent ? "ball.500" : "ink"}>
      {tournamentTypeLabel(level)}
    </Pill>
  );
};

/** The square W / L chip used for results and recent form. */
export const ResultChip = ({ won, size = "sm" }: { won: boolean; size?: "sm" | "lg" }) => (
  <Flex
    boxSize={size === "lg" ? "38px" : "28px"}
    align="center"
    justify="center"
    borderRadius="md"
    bg={won ? "ball.500" : "loss"}
    color={won ? "court.900" : "loss.ink"}
    fontWeight="bold"
    fontSize={size === "lg" ? "sm" : "xs"}
    aria-label={won ? "Win" : "Loss"}
    flexShrink={0}
  >
    {won ? "W" : "L"}
  </Flex>
);

/** "Champion" in the accent colour, anything else muted. */
export const OutcomePill = ({ label, highlight }: { label: string; highlight: boolean }) => (
  <Pill bg={highlight ? "ball.500" : "blackAlpha.50"} color={highlight ? "court.900" : "ink.muted"} px={3} py={1}>
    {label}
  </Pill>
);

/** A lime "added" status pill, for the admin bio columns. */
export const AddedPill = ({ children }: { children: React.ReactNode }) => (
  <Pill bg="ball.500" color="court.900" px={3} py={1}>
    {children}
  </Pill>
);
