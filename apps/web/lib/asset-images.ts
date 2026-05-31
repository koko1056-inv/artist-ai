/**
 * Real public-domain images for assets where the *work itself* is public domain
 * (paintings, old book/magazine illustrations, pre-1929 photographs). These are served
 * from Wikimedia Commons via the stable `Special:FilePath` redirect.
 *
 * They are rendered client-side by `AssetThumb`, which automatically falls back to the
 * local illustration if an image is unavailable — so a wrong/missing file never breaks a
 * tile. We intentionally omit assets where a clean public-domain photo is hard to confirm
 * (e.g. Betty Boop, Nancy Drew); those keep their original illustration.
 *
 * NOTE: these URLs load in the deployed app (the visitor's browser), not in CI/build.
 */
const commons = (file: string, width = 640) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export const ASSET_IMAGE_URLS: Record<string, string> = {
  // Public-domain artworks
  "hokusai-great-wave": commons("Tsunami by hokusai 19th century.jpg"),
  "van-gogh-starry-night": commons("Van Gogh - Starry Night - Google Art Project.jpg"),
  "leonardo-da-vinci": commons("Mona Lisa, by Leonardo da Vinci, from C2RMF retouched.jpg"),

  // Pre-1929 / public-domain photographs of historical figures
  "albert-einstein": commons("Albert Einstein 1921 by F Schmutzer - restoration.jpg"),
  "nikola-tesla": commons("Tesla circa 1890.jpeg"),

  // Public-domain book / magazine illustrations
  "sherlock-holmes": commons("Sherlock Holmes Portrait Paget.jpg"),
  "alice-in-wonderland": commons("Alice par John Tenniel 04.jpg"),
  "dracula": commons("Dracula1.jpg"),
  "frankenstein": commons("Frankenstein.1831.inside-cover.jpg"),
  "robin-hood": commons("Robin shoots with sir Guy by Louis Rhead 1912.png"),
  "pinocchio": commons("Le avventure di Pinocchio-pag017.jpg"),
  "wizard-of-oz": commons("The Wonderful Wizard of Oz, 006.jpg"),
  "steamboat-willie-mickey": commons("Steamboat Willie.jpg"),
};
