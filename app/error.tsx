"use client";

import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box textAlign="center" mt={20} px={4}>
      <Heading mb={2}>Something went wrong</Heading>
      <Text mb={6}>We couldn&apos;t load this page. Please try again.</Text>
      {error.digest && (
        <Text fontSize="sm" color="fg.muted" mb={6}>
          Reference: {error.digest}
        </Text>
      )}
      <Button onClick={() => reset()}>Try again</Button>
    </Box>
  );
}
