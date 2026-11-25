import { Box, Center, Spinner } from "@chakra-ui/react";

export default function Loading() {
  return (
    <>
      <Box bg="court.900" h={{ base: "160px", md: "240px" }} />
      <Center minH="40vh">
        <Spinner size="xl" color="court.900" />
      </Center>
    </>
  );
}
