/**
 * SANDBOX RUNTIME — the heart of the host (super) app.
 *
 * PD Forge does NOT ship a native binary per creator app. Instead, this single host
 * app loads creator app BUNDLES at runtime, over-the-air (OTA), and runs each one inside
 * an isolated sandbox. That keeps the App Store / Play Store footprint to one app while
 * thousands of creator apps update instantly without a store review cycle.
 *
 * HOW REAL LOADING WOULD WORK
 * ---------------------------
 * Two viable runtimes, both modeled by `SandboxRuntime` below:
 *
 *  1. WebView bundle (default for the MVP). The creator bundle is HTML/JS served from
 *     `bundleUrl`. We render it inside a react-native-webview with:
 *       - JavaScript enabled but `originWhitelist` locked down,
 *       - no access to the file system / cookies of other apps,
 *       - a `postMessage` channel that is the ONLY path to native capabilities. The host
 *         injects a small client that proxies calls to the `HostBridge` (see bridge.ts).
 *     This is the strongest isolation (OS-level web sandbox) and is trivially OTA-able.
 *
 *  2. Hermes JS bundle. The creator bundle is a precompiled Hermes bytecode bundle the
 *     host evaluates in a fresh JS context, with the `HostBridge` injected as the only
 *     global and React Native primitives provided by the host. Lighter weight UI, but the
 *     isolation guarantees must be enforced entirely in JS, so it is gated behind review.
 *
 * OTA FLOW
 * --------
 * The host asks the web API for the current `bundleUrl` (+ a content hash / version) for
 * an installed app. Bundles are immutable + content-addressed and cached on device. On
 * launch the host checks for a newer version, downloads in the background, and swaps it in
 * on next open. Expo Updates handles OTA for the HOST shell itself; creator bundles ride
 * the same idea one layer down.
 *
 * This file is a SKELETON: it renders a placeholder container describing what would load,
 * with the correct typed surface so the real WebView/Hermes loader can drop in later.
 */
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import { type Capability, type HostBridge, createHostBridge } from "./bridge";

/** Which isolation backend the host uses to run a given bundle. */
export type SandboxKind = "webview" | "hermes";

/** Lifecycle status of a sandboxed app instance. */
export type SandboxStatus = "idle" | "loading" | "ready" | "error";

/**
 * The contract a sandbox runtime implementation must satisfy. The host owns the instance
 * and the bridge; the creator bundle only ever sees the bridge.
 */
export interface SandboxRuntime {
  readonly appId: string;
  readonly kind: SandboxKind;
  /** Content-addressed bundle location served by the web API. */
  readonly bundleUrl: string;
  /** The single, capability-checked native surface handed to the bundle. */
  readonly bridge: HostBridge;
  /** Fetch (or revalidate) the bundle and start it. */
  load(): Promise<void>;
  /** Tear the instance down and revoke the bridge (e.g. on uninstall). */
  dispose(): void;
}

export interface SandboxProps {
  appId: string;
  bundleUrl: string;
  /** Capabilities the host granted this app (declared by its template). */
  capabilities?: ReadonlyArray<Capability>;
  kind?: SandboxKind;
}

/**
 * Placeholder sandbox container. In production this returns the WebView (or Hermes host)
 * and wires `postMessage` <-> `bridge`. Here it renders what would be loaded so the
 * navigation + install flow can be exercised end to end without a native runtime.
 */
export function Sandbox(props: SandboxProps): React.ReactElement {
  const { appId, bundleUrl, capabilities = ["storage"], kind = "webview" } = props;

  // The bridge is constructed once per app instance and is the ONLY capability surface.
  const bridge = React.useMemo<HostBridge>(
    () => createHostBridge(appId, capabilities),
    [appId, capabilities],
  );

  return (
    <View style={styles.container} testID="sandbox-container">
      <Text style={styles.heading}>Isolated sandbox</Text>
      <Text style={styles.label}>App ID</Text>
      <Text style={styles.value}>{appId}</Text>
      <Text style={styles.label}>Runtime</Text>
      <Text style={styles.value}>{kind === "webview" ? "WebView bundle" : "Hermes bundle"}</Text>
      <Text style={styles.label}>Bundle URL</Text>
      <Text style={styles.value} numberOfLines={2}>
        {bundleUrl}
      </Text>
      <Text style={styles.label}>Granted capabilities</Text>
      <Text style={styles.value}>{bridge.capabilities.join(", ") || "none"}</Text>
      <Text style={styles.note}>
        This creator app runs in an isolated sandbox and updates over-the-air. It can only
        reach the device through the host bridge listed above.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0f1116",
    borderRadius: 12,
  },
  heading: { color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  label: { color: "#8a93a6", fontSize: 12, marginTop: 10, textTransform: "uppercase" },
  value: { color: "#e6e9ef", fontSize: 14, marginTop: 2 },
  note: { color: "#8a93a6", fontSize: 12, marginTop: 20, lineHeight: 18 },
});
