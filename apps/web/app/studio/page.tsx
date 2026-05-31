import { APP_TEMPLATES, TEMPLATE_IDS, translate } from "@pd/core";
import { SectionTitle } from "../../components/ui";
import { loadAssets } from "../../lib/data";
import StudioClient from "./studio-client";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const assets = await loadAssets();

  // Resolve template display copy on the server (i18n catalog lives in @pd/core).
  const templates = TEMPLATE_IDS.map((id) => {
    const t = APP_TEMPLATES[id];
    return {
      id: t.id,
      name: translate(t.nameKey as Parameters<typeof translate>[0]),
      description: translate(t.descriptionKey as Parameters<typeof translate>[0]),
    };
  });

  return (
    <div>
      <SectionTitle
        eyebrow="Studio"
        title="Create a daily-use app"
        subtitle="Pick a template and an asset, browse its images and 3D models, describe your app, then generate and publish."
      />
      <StudioClient
        templates={templates}
        assets={assets}
        promptPlaceholder={translate("studio.prompt.placeholder")}
        generateLabel={translate("studio.generate")}
        publishLabel={translate("studio.publish")}
      />
    </div>
  );
}
