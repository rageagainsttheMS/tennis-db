import { Box, Flex, Link, Text } from "@chakra-ui/react";

const Footer = () => (
  <Box as="footer" borderTopWidth="1px" borderColor="line" mt={16}>
    <Flex maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6} justify="space-between" gap={4} wrap="wrap" fontSize="sm" color="ink.muted">
      <Text>© Tennis DB</Text>
      <Text>
        ATP tour-level match data from{" "}
        <Link href="https://tennisdata.app" target="_blank" rel="noopener noreferrer" color="ink" textDecoration="underline">
          tennisdata.app
        </Link>
      </Text>
    </Flex>
  </Box>
);

export default Footer;
