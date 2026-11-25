"use client";

import { Box, Flex, Menu, Portal, Text } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import { initials } from "@/lib/utils/display";

/** The signed-in user's pill in the header, with a sign-out menu. */
const MenuButton = ({ name }: { name: string }) => (
  <Menu.Root positioning={{ placement: "bottom-end" }}>
    <Menu.Trigger asChild>
      <Flex
        as="button"
        align="center"
        gap={2}
        pl={1}
        pr={{ base: 1, md: 4 }}
        py={1}
        borderRadius="full"
        borderWidth="1px"
        borderColor="hero.line"
        bg="court.800"
        cursor="pointer"
        _hover={{ bg: "court.700" }}
        aria-label={`Account menu for ${name}`}
      >
        <Flex boxSize="32px" borderRadius="full" bg="ball.500" color="court.900" align="center" justify="center" fontSize="xs" fontWeight="bold">
          {initials(name)}
        </Flex>
        <Text display={{ base: "none", md: "block" }} fontSize="sm" fontWeight="medium" color="hero.text">
          {name}
        </Text>
      </Flex>
    </Menu.Trigger>
    <Portal>
      <Menu.Positioner>
        <Menu.Content boxShadow="lg">
          <Box px={2} py={1.5} fontSize="xs" color="ink.muted">
            Signed in as {name}
          </Box>
          <Menu.Item onClick={() => signOut()} value="logout">
            Sign out
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  </Menu.Root>
);

export default MenuButton;
