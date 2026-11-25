"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ROUTES } from "@/types/constants";
import { BallIcon } from "./BallIcon";
import MenuButton from "./Menu";

const NAV = [
  { href: ROUTES.PLAYERS, label: "Players", match: [ROUTES.PLAYERS, ROUTES.PLAYERPROFILE] },
  { href: ROUTES.TOURNAMENTS, label: "Tournaments", match: [ROUTES.TOURNAMENTS, ROUTES.TOURNAMENT + "/"] },
];

const NavLink = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
  <Link href={href} aria-current={active ? "page" : undefined}>
    <Box
      as="span"
      display="block"
      whiteSpace="nowrap"
      px={{ base: 2, md: 3 }}
      py={2}
      fontWeight={active ? "semibold" : "medium"}
      fontSize={{ base: "sm", md: "md" }}
      color={active ? "hero.text" : "hero.muted"}
      borderBottomWidth="3px"
      borderColor={active ? "ball.500" : "transparent"}
      _hover={{ color: "hero.text" }}
    >
      {label}
    </Box>
  </Link>
);

function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <Box as="header" bg="court.900" color="hero.text">
      <Flex maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={4} align="center" justify="space-between" gap={{ base: 2, md: 4 }}>
        <Link href="/" aria-label="Tennis DB home">
          <Flex align="center" gap={2.5}>
            <BallIcon size={26} />
            <Text fontFamily="heading" fontWeight="bold" fontSize={{ base: "lg", md: "xl" }} whiteSpace="nowrap" display={{ base: "none", sm: "block" }}>
              Tennis DB
            </Text>
          </Flex>
        </Link>
        <Flex align="center" gap={{ base: 1, md: 4 }}>
          <Flex as="nav" align="center" gap={{ base: 0, md: 2 }}>
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={item.match.some((prefix) => pathname === prefix || pathname.startsWith(prefix.endsWith("/") ? prefix : prefix + "/"))}
              />
            ))}
          </Flex>
          {session?.user?.name ? (
            <MenuButton name={session.user.name} />
          ) : (
            status === "unauthenticated" &&
            pathname !== ROUTES.SIGNIN && (
              <Link href={ROUTES.SIGNIN}>
                <Box
                  as="span"
                  display="block"
                  px={4}
                  py={2}
                  whiteSpace="nowrap"
                  borderRadius="full"
                  borderWidth="1px"
                  borderColor="hero.line"
                  fontSize="sm"
                  fontWeight="medium"
                  _hover={{ bg: "court.800" }}
                >
                  Sign in
                </Box>
              </Link>
            )
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
