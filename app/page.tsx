import Link from "next/link";
import { Box, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import HomeSearch from "@/components/ui/home/HomeSearch";
import { SurfaceBadge } from "@/components/ui/shared/Badges";
import { Container, CourtLines, Eyebrow, Hero, SectionHeading } from "@/components/ui/shared/Layout";
import { GRAND_SLAMS, ROUTES } from "@/types/constants";

const SURFACES = [
  { key: "hard", label: "Hard", bg: "surface.hard" },
  { key: "clay", label: "Clay", bg: "surface.clay" },
  { key: "grass", label: "Grass", bg: "surface.grass" },
] as const;

export default function Home() {
  return (
    <>
      <Hero pb={{ base: 16, md: 24 }}>
        <Container position="relative">
          <CourtLines display={{ base: "none", md: "block" }} top={4} bottom="22%" left="6%" right="6%" />
          <Box position="relative" textAlign="center" pt={{ base: 10, md: 20 }}>
            <Eyebrow>The tennis database</Eyebrow>
            <Heading
              as="h1"
              fontFamily="heading"
              fontWeight="bold"
              fontSize={{ base: "4xl", sm: "5xl", md: "7xl" }}
              lineHeight="1.02"
              letterSpacing="-0.02em"
              mt={5}
              mb={6}
            >
              Every player.
              <br />
              Every tournament.
              <br />
              One search.
            </Heading>
            <Text color="hero.muted" fontSize={{ base: "md", md: "lg" }} maxW="560px" mx="auto" mb={{ base: 8, md: 12 }}>
              Look up careers, results and draws from across the ATP tour, in seconds.
            </Text>
            <HomeSearch />
          </Box>
        </Container>
      </Hero>

      <Container pt={{ base: 12, md: 16 }}>
        <SectionHeading
          aside={
            <Link href={ROUTES.TOURNAMENTS}>
              <Text fontWeight="semibold" textDecoration="underline" color="ink">
                All tournaments →
              </Text>
            </Link>
          }
        >
          Browse by surface
        </SectionHeading>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={5} mb={{ base: 12, md: 16 }}>
          {SURFACES.map((surface) => (
            <Link key={surface.key} href={`${ROUTES.TOURNAMENTS}?surface=${surface.key}`}>
              <Flex
                direction="column"
                justify="space-between"
                bg={surface.bg}
                color="white"
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                h={{ base: "150px", md: "200px" }}
                transition="transform 0.15s"
                _hover={{ transform: "translateY(-3px)" }}
              >
                <Text fontSize="sm" fontWeight="semibold" letterSpacing="0.14em" opacity={0.85}>
                  SURFACE
                </Text>
                <Flex justify="space-between" align="flex-end">
                  <Text fontFamily="heading" fontWeight="bold" fontSize={{ base: "4xl", md: "5xl" }} lineHeight="1">
                    {surface.label}
                  </Text>
                  <Text fontWeight="medium">Explore →</Text>
                </Flex>
              </Flex>
            </Link>
          ))}
        </Grid>

        <SectionHeading>The Grand Slams</SectionHeading>
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap={5}>
          {GRAND_SLAMS.map((slam) => (
            <Link key={slam.id} href={`${ROUTES.TOURNAMENT}/${slam.id}`}>
              <Flex
                direction="column"
                justify="space-between"
                gap={6}
                bg="card"
                borderWidth="1px"
                borderColor="line"
                borderRadius="2xl"
                p={6}
                h="100%"
                _hover={{ borderColor: "ink.muted" }}
              >
                <Text fontFamily="heading" fontWeight="bold" fontSize="2xl" color="ink">
                  {slam.name}
                </Text>
                <Box>
                  <SurfaceBadge surface={slam.surface} />
                </Box>
              </Flex>
            </Link>
          ))}
        </Grid>
      </Container>
    </>
  );
}
