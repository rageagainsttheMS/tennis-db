

import { Heading, Box, Flex } from "@chakra-ui/react";
import Link from "next/link";
import MenuButton from "./Menu";
import { auth } from "@/auth";

const Header = async () => {
  const session = await auth();
  return (
    <Box as="header" width="100%" borderBottomWidth={1} bg="gray.800">
      <Flex maxW="7xl" mx="auto" align="center" justify="space-between" py={3} px={4}>
        <Link href="/">
          <Heading fontSize="3xl" fontWeight="bold" color="gray.100" pl={4}>
            Tennis DB
          </Heading>
        </Link>
        {session?.user?.name && <MenuButton name={session?.user?.name} />}
      </Flex>
    </Box>
  );
};

export default Header;
