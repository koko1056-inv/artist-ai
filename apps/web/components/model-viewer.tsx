"use client";

import { createElement, useEffect, useState, type CSSProperties } from "react";

const MODEL_VIEWER_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

/** Inject the model-viewer module script once (idempotent across mounts). */
function useModelViewerScript(): void {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector(`script[data-model-viewer="true"]`)) return;
    const script = document.createElement("script");
    script.type = "module";
    script.src = MODEL_VIEWER_SRC;
    script.dataset.modelViewer = "true";
    document.head.appendChild(script);
  }, []);
}

/**
 * Renders the `<model-viewer>` web component (loaded from a CDN — no npm dependency).
 * We use `createElement` with the custom tag so we don't depend on JSX intrinsic-element
 * typing, which is brittle across React versions. Falls back to the poster image if the
 * model fails to load.
 */
export function ModelViewer({
  src,
  poster,
  alt,
  className,
}: {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
}) {
  useModelViewerScript();
  const [failed, setFailed] = useState(false);

  if (failed) {
    return poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={poster}
        alt={alt}
        className={className ?? "h-full w-full object-cover"}
      />
    ) : (
      <div
        className={`flex items-center justify-center bg-paper-2 text-xs text-ink-soft ${
          className ?? "h-full w-full"
        }`}
      >
        3D preview unavailable
      </div>
    );
  }

  const style: CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: "var(--color-paper-2)",
  };

  return createElement(
    "model-viewer",
    {
      src,
      poster,
      alt,
      "camera-controls": true,
      "auto-rotate": true,
      ar: true,
      "shadow-intensity": "1",
      className,
      style,
    },
    poster
      ? createElement("img", {
          slot: "poster",
          src: poster,
          alt,
          className: "h-full w-full object-cover",
          onError: () => setFailed(true),
        })
      : null,
  );
}
