"use client";
import { Box, Flex, Heading, Text, type BoxProps } from "@chakra-ui/react";

/** Centred page width, shared by the header, heroes and page bodies. */
export const Container = (props: BoxProps) => <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} {...props} />;

/** The dark green band under the header. */
export const Hero = ({ children, ...props }: BoxProps) => (
  <Box bg="court.900" color="hero.text" position="relative" overflow="hidden" {...props}>
    {children}
  </Box>
);

/** Faint court lines drawn behind a hero. Decorative only. */
export const CourtLines = (props: BoxProps) => (
  <Box position="absolute" pointerEvents="none" aria-hidden="true" borderWidth="2px" borderColor="whiteAlpha.100" {...props}>
    <Box position="absolute" top="12%" bottom="12%" left={0} right={0} borderTopWidth="2px" borderBottomWidth="2px" borderColor="whiteAlpha.100" />
    <Box position="absolute" top="12%" bottom="12%" left="50%" borderLeftWidth="2px" borderColor="whiteAlpha.100" />
  </Box>
);

/** "DIRECTORY" style label above a hero title. */
export const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text color="ball.500" fontSize="sm" fontWeight="semibold" letterSpacing="0.14em" textTransform="uppercase">
    {children}
  </Text>
);

/** A small dark stat box in a hero: a big number and a caption. */
export const HeroStat = ({ label, value, caption, accent = false }: { label?: string; value: React.ReactNode; caption?: React.ReactNode; accent?: boolean }) => (
  <Box bg="court.800" borderWidth="1px" borderColor="hero.line" borderRadius="xl" px={5} py={4} minW={0}>
    {label && (
      <Text fontSize="sm" color="hero.muted" mb={1}>
        {label}
      </Text>
    )}
    <Text fontFamily="heading" fontWeight="bold" fontSize={{ base: "3xl", md: "4xl" }} lineHeight="1.1" color={accent ? "ball.500" : "hero.text"} className="tabular">
      {value}
    </Text>
    {caption && (
      <Text fontSize="sm" color="hero.muted" mt={1}>
        {caption}
      </Text>
    )}
  </Box>
);

/** A white card with a hairline border. */
export const Card = (props: BoxProps) => <Box bg="card" borderWidth="1px" borderColor="line" borderRadius="2xl" {...props} />;

export const SectionHeading = ({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) => (
  <Flex justify="space-between" align="baseline" gap={4} mb={5} wrap="wrap">
    <Heading as="h2" fontFamily="heading" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="ink">
      {children}
    </Heading>
    {aside}
  </Flex>
);
