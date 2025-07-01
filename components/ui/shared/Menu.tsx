import { Button, Menu, Portal } from "@chakra-ui/react"
import { signOut } from "next-auth/react";

const MenuButton = async ({name} : {name: string;}) => {

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm">
          {name}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item  onClick={() => signOut()} value="logout">Logout</Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export default MenuButton;
