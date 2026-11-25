"use client";
import { useEffect, useState } from "react";
import { Flex, Image } from "@chakra-ui/react";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { initials } from "@/lib/utils/display";

/** The S3 image for a stored key, or null until it loads (or when there's none). */
export function useStoredImage(key: string | null | undefined) {
  const { getPresignedUrl } = useImageUpload();
  const [src, setSrc] = useState<{ key: string; url: string } | null>(null);

  useEffect(() => {
    if (!key) return;
    getPresignedUrl(key)
      .then((url) => setSrc({ key, url }))
      .catch((error) => console.error("Failed to get image URL:", error));
  }, [key, getPresignedUrl]);

  return key && src?.key === key ? src.url : null;
}

type AvatarVariant = "hero" | "row" | "rowHighlight";

const STYLES: Record<AvatarVariant, { bg: string; color: string; border?: string }> = {
  hero: { bg: "court.800", color: "ball.500", border: "ball.500" },
  row: { bg: "blackAlpha.50", color: "ink.muted" },
  rowHighlight: { bg: "court.900", color: "ball.500" },
};

/** A round avatar: the player's photo if there is one, otherwise their initials. */
export const PlayerAvatar = ({
  name,
  image,
  size,
  variant = "row",
}: {
  name: string;
  image?: string | null;
  size: string | Record<string, string>;
  variant?: AvatarVariant;
}) => {
  const src = useStoredImage(variant === "hero" ? image : null);
  const style = STYLES[variant];
  const border = style.border ? { borderWidth: "3px", borderColor: style.border } : {};

  if (src) {
    return <Image src={src} alt={name} boxSize={size} borderRadius="full" objectFit="cover" flexShrink={0} {...border} />;
  }
  return (
    <Flex
      boxSize={size}
      borderRadius="full"
      align="center"
      justify="center"
      bg={style.bg}
      color={style.color}
      fontFamily="heading"
      fontWeight="bold"
      fontSize={variant === "hero" ? { base: "2xl", md: "5xl" } : "xs"}
      flexShrink={0}
      aria-hidden="true"
      {...border}
    >
      {initials(name)}
    </Flex>
  );
};
