import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * The Tennis DB design system: a dark "court" green, an optic-yellow "ball" accent,
 * and one colour per surface. Light mode only for now.
 */
const config = defineConfig({
  globalCss: {
    body: { bg: "page", color: "ink", fontFamily: "body" },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-heading), system-ui, sans-serif" },
        body: { value: "var(--font-body), system-ui, sans-serif" },
      },
      colors: {
        court: {
          950: { value: "#0B241A" },
          900: { value: "#0F2E22" },
          800: { value: "#1B3B2E" },
          700: { value: "#2A4A3C" },
          600: { value: "#3E5C4E" },
        },
        ball: {
          400: { value: "#E4F56B" },
          500: { value: "#DDF247" },
          600: { value: "#A7BF1A" },
        },
        surface: {
          hard: { value: "#22508F" },
          clay: { value: "#AE4320" },
          grass: { value: "#2F6E34" },
        },
      },
    },
    semanticTokens: {
      colors: {
        page: { value: "#F3F4EF" },
        card: { value: "#FFFFFF" },
        ink: { value: "#13261D" },
        "ink.muted": { value: "#56655D" },
        line: { value: "#E3E6DF" },
        loss: { value: "#F9DEDA" },
        "loss.ink": { value: "#9B2C1F" },
        // Text and borders on the dark hero.
        "hero.text": { value: "#FFFFFF" },
        "hero.muted": { value: "#B9C7BF" },
        "hero.line": { value: "rgba(255,255,255,0.12)" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
