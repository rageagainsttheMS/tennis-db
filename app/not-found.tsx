import Link from "next/link";
import { Heading, Text } from "@chakra-ui/react";
import { Container } from "@/components/ui/shared/Layout";

export default function NotFound() {
  return (
    <Container textAlign="center" py={24}>
      <Heading as="h1" fontFamily="heading" fontSize="4xl" mb={3}>
        404 - Page Not Found
      </Heading>
      <Text color="ink.muted" mb={6}>
        The page you are looking for does not exist.
      </Text>
      <Link href="/">
        <Text as="span" fontWeight="semibold" textDecoration="underline">
          Back to search →
        </Text>
      </Link>
    </Container>
  );
}
