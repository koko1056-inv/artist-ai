import { trackEventSchema } from "@pd/contracts";
import { apiError, apiOk } from "../../../lib/api";
import { recordActive } from "../../../lib/usage-store";

export const dynamic = "force-dynamic";

/** POST /api/track — anonymous daily active ping from a published app (north-star: WAU). */
export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return apiError("invalid_json", "Request body must be valid JSON.");
  }
  const parsed = trackEventSchema.safeParse(json);
  if (!parsed.success) {
    return apiError("invalid_request", parsed.error.issues[0]?.message ?? "Invalid request.");
  }
  const { appId, anonId, day } = parsed.data;
  recordActive(appId, anonId, day);
  return apiOk({ ok: true });
}
