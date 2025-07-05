"use client";

import { Button, Menu, Portal } from "@chakra-ui/react";
import { signOut } from "next-auth/react";

const MenuButton = ({ name }: { name: string }) => {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          bg="white"
          color="gray.800"
          borderColor="gray.300"
          _hover={{ bg: "gray.100" }}
          boxShadow="sm"
        >
          {name}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content bg="white" borderColor="gray.200" boxShadow="lg">
            <Menu.Item
              onClick={() => signOut()}
              value="logout"
              _hover={{ bg: "gray.100" }}
              color="gray.800"
            >
              Logout
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default MenuButton;