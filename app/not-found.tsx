import { Box, Heading, Text } from "@chakra-ui/react";

export default function NotFound() {
  return (
    <Box textAlign="center" mt={20}>
      <Heading>404 - Page Not Found</Heading>
      <Text>The page you are looking for does not exist.</Text>
    </Box>
  );
}