/**
 * Rich media attached to an asset. The creation experience is "browse and pick media":
 * a character may ship multiple images, poses/sprites, a 3D model, and audio. The studio
 * filters by these kinds and previews them (image lightbox, 3D viewer, audio player).
 */

export type AssetMediaKind =
  | "character-image"
  | "sprite"
  | "pose"
  | "3d-model"
  | "audio"
  | "artwork"
  | "icon";

export type AssetMediaFormat =
  | "png"
  | "jpg"
  | "svg"
  | "glb"
  | "gltf"
  | "mp3"
  | "wav";

export interface AssetMedia {
  id: string;
  assetId: string;
  kind: AssetMediaKind;
  format: AssetMediaFormat;
  label: string;
  /** Source URL of the image / 3D model / audio file. */
  url: string;
  /** Preview image for non-image media (3D models, audio). */
  posterUrl?: string;
  width?: number;
  height?: number;
}

/** UI filter groups for the media browser. */
export const MEDIA_KIND_GROUPS = {
  images: ["character-image", "sprite", "pose", "artwork", "icon"] as AssetMediaKind[],
  threeD: ["3d-model"] as AssetMediaKind[],
  audio: ["audio"] as AssetMediaKind[],
} as const;

export type MediaGroup = keyof typeof MEDIA_KIND_GROUPS;

export function mediaGroupOf(kind: AssetMediaKind): MediaGroup {
  if (MEDIA_KIND_GROUPS.threeD.includes(kind)) return "threeD";
  if (MEDIA_KIND_GROUPS.audio.includes(kind)) return "audio";
  return "images";
}

export function is3dFormat(format: AssetMediaFormat): boolean {
  return format === "glb" || format === "gltf";
}
