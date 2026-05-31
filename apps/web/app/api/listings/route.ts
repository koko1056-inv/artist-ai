import { apiError, apiOk } from "../../../lib/api";
import { loadListings } from "../../../lib/data";

export const dynamic = "force-dynamic";

/** GET /api/listings — published marketplace listings (DB or sample fallback). */
export async function GET(): Promise<Response> {
  try {
    const listings = await loadListings();
    return apiOk(listings);
  } catch {
    return apiError("listings_unavailable", "Could not load listings.", 500);
  }
}
