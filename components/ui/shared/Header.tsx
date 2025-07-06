"use client";
import { Heading, Box, Flex, Button } from "@chakra-ui/react";
import Link from "next/link";
import MenuButton from "./Menu";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ADMINROLE, HIGHLIGHT_BORDER, HIGHLIGHT_BORDER_WIDTH, ROUTES } from "@/types/constants";

function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const pathname = usePathname();
  return (
    <Box as="header" width="100%" borderBottomWidth={1}>
      <Flex mx="auto" justify={"space-between"} py={3} px={4}>
        <Link href="/">
          <Heading fontSize="3xl" fontWeight="bold" pl={4}>
            Tennis DB
          </Heading>
        </Link>
        <Flex mx="-1" justify={"end"} gap={2}>
          {session?.user?.role === ADMINROLE && (
            <>
              <Button
                variant="subtle"
                borderColor={pathname === ROUTES.PLAYERADMIN ? HIGHLIGHT_BORDER : 'transparent'}
                borderWidth={pathname === ROUTES.PLAYERADMIN ? HIGHLIGHT_BORDER_WIDTH : '0'}
                size="sm"
                onClick={() => router.push(ROUTES.PLAYERADMIN)}
              >
                Players
              </Button>
              <Button variant="subtle" size="sm" onClick={() => router.push(ROUTES.TOURNADMIN)}>Tournaments</Button>
            </>
          )}
          {session?.user?.name && <MenuButton name={session?.user?.name} role={session?.user?.role} />}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
