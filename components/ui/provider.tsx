"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"
import type { ThemeProviderProps } from "next-themes"
import { system } from "@/theme"

export function Provider(props: ThemeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme="light" forcedTheme="light" {...props} />
    </ChakraProvider>
  )
}
