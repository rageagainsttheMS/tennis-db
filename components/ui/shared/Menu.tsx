"use client";

import { ROUTES } from "@/types/constants";
import { Button, Menu, Portal } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const MenuButton = ({ name, role }: { name: string; role: string }) => {
  const router = useRouter();
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="subtle" size="sm">
          {name}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content boxShadow="lg">
            <Menu.Item onClick={() => signOut()} value="logout">
              Logout
            </Menu.Item>
            {role === "admin" && (
              <Menu.Item
                onClick={() => router.push(ROUTES.PLAYERADMIN)}
                value="adminPlayers"
              >
                Admin
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default MenuButton;
