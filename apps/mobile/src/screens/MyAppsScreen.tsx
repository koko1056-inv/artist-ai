/**
 * MyAppsScreen — the user's installed creator apps.
 *
 * Installed apps are held in local state by `App` (in a real build this is persisted via
 * the host storage layer and reconciled against the web API for OTA bundle updates).
 * Opening an app mounts it inside the `Sandbox` runtime.
 */
import * as React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { type TemplateId } from "@pd/core";

import { Sandbox } from "../runtime/Sandbox";
import { type Capability } from "../runtime/bridge";

/** An app the user has installed into the host. */
export interface InstalledApp {
  /** App identity (matches `Listing.appId`). */
  appId: string;
  title: string;
  creatorName: string;
  templateId: TemplateId;
  /** Content-addressed sandbox bundle served by the web API. */
  bundleUrl: string;
  /** Capabilities granted to this app (derived from its template). */
  capabilities: ReadonlyArray<Capability>;
}

export interface MyAppsScreenProps {
  apps: ReadonlyArray<InstalledApp>;
}

export function MyAppsScreen(props: MyAppsScreenProps): React.ReactElement {
  const { apps } = props;
  const [openAppId, setOpenAppId] = React.useState<string | null>(null);

  const openApp = apps.find((a) => a.appId === openAppId) ?? null;

  if (openApp) {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.backButton}
          onPress={() => setOpenAppId(null)}
          accessibilityRole="button"
        >
          <Text style={styles.backText}>← Back to my apps</Text>
        </Pressable>
        <Sandbox
          appId={openApp.appId}
          bundleUrl={openApp.bundleUrl}
          capabilities={openApp.capabilities}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={apps}
      keyExtractor={(item) => item.appId}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No apps installed yet</Text>
          <Text style={styles.emptyBody}>
            Install an app from the Marketplace to run it here in the sandbox.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() => setOpenAppId(item.appId)}
          accessibilityRole="button"
          testID={`open-${item.appId}`}
        >
          <View style={styles.rowText}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.creator}>by {item.creatorName}</Text>
          </View>
          <Text style={styles.openHint}>Open ›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listContent: { padding: 16 },
  backButton: { paddingVertical: 8, marginBottom: 8 },
  backText: { color: "#5b8cff", fontSize: 15 },
  empty: { alignItems: "center", padding: 32 },
  emptyTitle: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  emptyBody: { color: "#8a93a6", fontSize: 14, textAlign: "center", marginTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161a22",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  rowText: { flex: 1 },
  title: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  creator: { color: "#8a93a6", fontSize: 13, marginTop: 2 },
  openHint: { color: "#5b8cff", fontSize: 14 },
});
