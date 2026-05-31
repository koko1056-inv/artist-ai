import { apiError, apiOk } from "../../../lib/api";
import { loadAssets } from "../../../lib/data";

export const dynamic = "force-dynamic";

/** GET /api/assets — the public-domain asset catalog (DB or sample fallback). */
export async function GET(): Promise<Response> {
  try {
    const assets = await loadAssets();
    return apiOk(assets);
  } catch {
    return apiError("assets_unavailable", "Could not load the asset library.", 500);
  }
}
