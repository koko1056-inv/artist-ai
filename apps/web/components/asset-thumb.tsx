"use client";

import { useState } from "react";
import { ASSET_IMAGE_URLS } from "../lib/asset-images";

/**
 * Renders an asset's real public-domain image when one is available, falling back to the
 * bundled illustration if it fails to load. This keeps the catalog visual with genuine
 * public-domain artwork while guaranteeing a tile never breaks.
 */
export function AssetThumb({
  slug,
  fallbackSrc,
  alt,
  className,
}: {
  slug: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}) {
  const real = ASSET_IMAGE_URLS[slug];
  const [src, setSrc] = useState(real ?? fallbackSrc);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (src !== fallbackSrc) setSrc(fallbackSrc);
      }}
    />
  );
}
