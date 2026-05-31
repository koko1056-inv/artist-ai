/**
 * Root host-app component.
 *
 * Implements lightweight tab navigation WITHOUT an external navigation library (keeping
 * the skeleton's dependency surface minimal): a simple piece of state selects which of
 * the three top-level screens — Marketplace, My Apps, Account — is shown. Installed apps
 * are held here and passed down; installing from the Marketplace adds to the list and
 * switches to the My Apps tab where the app can be opened in the sandbox.
 */
import * as React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { type Listing } from "@pd/contracts";
import { APP_TEMPLATES } from "@pd/core";

import { AccountScreen } from "./screens/AccountScreen";
import { MarketplaceScreen } from "./screens/MarketplaceScreen";
import { type InstalledApp, MyAppsScreen } from "./screens/MyAppsScreen";

type Tab = "marketplace" | "myApps" | "account";

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: "marketplace", label: "Marketplace" },
  { id: "myApps", label: "My Apps" },
  { id: "account", label: "Account" },
];

export function App(): React.ReactElement {
  const [tab, setTab] = React.useState<Tab>("marketplace");
  const [installed, setInstalled] = React.useState<ReadonlyArray<InstalledApp>>([]);

  const handleInstall = React.useCallback((listing: Listing) => {
    setInstalled((prev) => {
      if (prev.some((a) => a.appId === listing.appId)) {
        return prev; // already installed
      }
      const app: InstalledApp = {
        appId: listing.appId,
        title: listing.title,
        creatorName: listing.creatorName,
        templateId: listing.templateId,
        // In production the bundle URL comes from the install/generate response; the
        // skeleton derives a placeholder so the sandbox has something to display.
        bundleUrl: `https://bundles.pdforge.app/${listing.appId}/latest`,
        // Capabilities are scoped to what the app's template declares — the host never
        // grants more than the template needs (see Sandbox / bridge security boundary).
        capabilities: APP_TEMPLATES[listing.templateId].capabilities,
      };
      return [...prev, app];
    });
    setTab("myApps");
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>PD Forge</Text>
      </View>

      <View style={styles.screen}>
        {tab === "marketplace" ? <MarketplaceScreen onInstall={handleInstall} /> : null}
        {tab === "myApps" ? <MyAppsScreen apps={installed} /> : null}
        {tab === "account" ? <AccountScreen currentPlanId="free" /> : null}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <Pressable
              key={item.id}
              style={styles.tabButton}
              onPress={() => setTab(item.id)}
              accessibilityRole="button"
              testID={`tab-${item.id}`}
            >
              <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0e14" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222836",
  },
  brand: { color: "#ffffff", fontSize: 20, fontWeight: "800" },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#222836",
    backgroundColor: "#0f1116",
  },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabLabel: { color: "#8a93a6", fontSize: 13 },
  tabLabelActive: { color: "#5b8cff", fontWeight: "700" },
});
