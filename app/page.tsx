import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Box, Center, Heading, Input, Flex } from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";
import { ROUTES } from "@/types/constants";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect(ROUTES.SIGNIN);
  }

  return (
    <Center minH="80vh" flexDirection="column">
      <Heading mb={8} fontSize={{ base: "2xl", md: "3xl" }} textAlign="center">
        Search the ultimate tennis database
      </Heading>
      <Box w={{ base: "100%", sm: "480px" }}>
        <Tabs.Root defaultValue="players">
          <Tabs.List mb={4}>
            <Tabs.Trigger value="players">Players</Tabs.Trigger>
            <Tabs.Trigger value="tournaments">Tournaments</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="players">
            <Flex as="form" boxShadow="lg" borderRadius="full" bg="white" px={4} py={2} align="center">
              <Input
                placeholder="Search players..."
                variant="subtle"
                fontSize="lg"
                _placeholder={{ color: "gray.400" }}
              />
            </Flex>
          </Tabs.Content>
          <Tabs.Content value="tournaments">
            <Flex as="form" boxShadow="lg" borderRadius="full" bg="white" px={4} py={2} align="center">
              <Input
                placeholder="Search tournaments..."
                variant="subtle"
                fontSize="lg"
                _placeholder={{ color: "gray.400" }}
              />
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Center>
  );
}
