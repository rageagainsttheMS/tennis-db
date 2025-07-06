"use client";
import { Box, Button, Flex, Text, Heading } from "@chakra-ui/react";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, gray.900, gray.800, indigo.950)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        w="full"
        maxW="md"
        bg="white"
        rounded="xl"
        shadow="2xl"
        overflow="hidden"
        p={8}
      >
        {/* Header */}
        <Flex direction="column" gap={6} mb={8}>
          <Flex direction="column" gap={2}>
            <Heading
              fontSize="3xl"
              fontWeight="bold"
              textAlign={"center"}
            >
              Welcome to Tennis DB!
            </Heading>
            <Text textAlign="center">
              Sign in to your account to continue
            </Text>
          </Flex>
        </Flex>
        {/* Sign In Form */}
        <Flex direction="column" gap={5}>
          <Button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            w="auto"
            px={4}
            py={2}
            borderWidth={1}
            rounded="md"
            bg="black"
            fontWeight="medium"
            shadow="sm"
            _hover={{ bg: "gray.50" }}
            _focus={{
              outline: "none",
              ring: 2,
              ringOffset: 2,
              ringColor: "blue.500",
            }}
            transition="all 0.2s"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                style={{ marginRight: 8 }}
              >
                <g>
                  <path
                    fill="#4285F4"
                    d="M44.5 20H24v8.5h11.7C34.7 32.1 30.1 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6.4-6.4C33.3 6.5 28.9 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19c9.5 0 18-7.5 18-19 0-1.3-.1-2.7-.5-4z"
                  />
                  <path
                    fill="#34A853"
                    d="M6.3 14.7l7 5.1C15.5 16.2 19.4 13 24 13c2.6 0 5 .9 6.9 2.4l6.4-6.4C33.3 6.5 28.9 5 24 5c-7.2 0-13.3 4.1-16.7 9.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M24 43c5.9 0 10.9-1.9 14.5-5.1l-6.7-5.5C29.9 34.1 27.1 35 24 35c-6.1 0-10.7-3.9-12.5-9.1l-7 5.4C7.1 39.1 14.9 43 24 43z"
                  />
                  <path
                    fill="#EA4335"
                    d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 6.5-11.7 6.5-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6.4-6.4C33.3 6.5 28.9 5 24 5c-7.2 0-13.3 4.1-16.7 9.7z"
                  />
                </g>
              </svg>
            </span>
            Sign in with Google
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
