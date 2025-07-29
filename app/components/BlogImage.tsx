"use client";

import Image, { ImageProps } from "next/image";
import clsx from "clsx";

interface BlogImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * BlogImage wraps Next.js <Image> to impose sensible defaults for blog content:
 *  • responsive layout with width 100%
 *  • rounded corners & object-cover unless overridden
 *  • lazy loading & blur placeholder (auto for local images)
 *  • easily adjustable via props
 */
export default function BlogImage({
  src,
  alt = "Blog image",
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw",
  priority = false,
  ...rest
}: BlogImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      // @ts-ignore - allow external images without static import blur.
      blurDataURL={
        // tiny transparent pixel as fallback; real blur handled for local imgs
        "data:image/gif;base64,R0lGODlhAQABAAAAACw="
      }
      className={clsx("object-cover w-full h-full rounded-2xl", className)}
      {...rest}
    />
  );
}
