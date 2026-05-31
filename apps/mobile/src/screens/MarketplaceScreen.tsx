/**
 * MarketplaceScreen — browse published creator apps.
 *
 * Listings come from the web API (`ROUTES.listings()`). Every item is validated at the
 * boundary with `listingSchema` from `@pd/contracts`, so malformed/hostile responses can
 * never reach the UI as a trusted `Listing`. Pressing Install hands the app off to the
 * sandbox runtime via the `onInstall` callback supplied by `App`.
 */
import * as React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { type Listing, listingSchema } from "@pd/contracts";
import { type CurrencyCode, formatMoney, makeT, money } from "@pd/core";

import { ROUTES } from "../config";

const t = makeT("en");

/** Narrow the contract's free-form 3-char currency string to a `CurrencyCode`. */
const SUPPORTED_CURRENCIES: ReadonlySet<string> = new Set(["USD", "EUR", "GBP", "JPY"]);
function toCurrencyCode(currency: string): CurrencyCode {
  return SUPPORTED_CURRENCIES.has(currency) ? (currency as CurrencyCode) : "USD";
}

export interface MarketplaceScreenProps {
  /** Called when the user installs a listing; `App` routes it into MyApps + the sandbox. */
  onInstall: (listing: Listing) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; listings: Listing[] };

async function fetchListings(): Promise<Listing[]> {
  const res = await fetch(ROUTES.listings());
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  const raw: unknown = await res.json();
  // The API returns an array of listings; validate each one with the shared schema.
  const parsed = listingSchema.array().safeParse(raw);
  if (!parsed.success) {
    throw new Error("Received malformed marketplace data.");
  }
  return parsed.data;
}

export function MarketplaceScreen(props: MarketplaceScreenProps): React.ReactElement {
  const { onInstall } = props;
  const [state, setState] = React.useState<LoadState>({ status: "loading" });

  const load = React.useCallback(() => {
    setState({ status: "loading" });
    fetchListings()
      .then((listings) => setState({ status: "ready", listings }))
      .catch((err: unknown) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Could not load listings.",
        }),
      );
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <View style={styles.centered} testID="marketplace-loading">
        <ActivityIndicator size="large" color="#5b8cff" />
        <Text style={styles.muted}>Loading marketplace…</Text>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View style={styles.centered} testID="marketplace-error">
        <Text style={styles.errorText}>{state.message}</Text>
        <Pressable style={styles.retryButton} onPress={load} accessibilityRole="button">
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={state.listings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.muted}>No apps published yet.</Text>
        </View>
      }
      renderItem={({ item }) => <ListingCard listing={item} onInstall={onInstall} />}
    />
  );
}

function ListingCard(props: {
  listing: Listing;
  onInstall: (listing: Listing) => void;
}): React.ReactElement {
  const { listing, onInstall } = props;
  const price =
    listing.priceMinor === 0
      ? "Free"
      : formatMoney(money(listing.priceMinor, toCurrencyCode(listing.currency)));

  return (
    <View style={styles.card} testID={`listing-${listing.id}`}>
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.creator}>{t("marketplace.byCreator", { creator: listing.creatorName })}</Text>
      <Text style={styles.summary} numberOfLines={2}>
        {listing.summary}
      </Text>

      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t("provenance.label")}</Text>
        </View>
        {listing.aiAssisted ? (
          <View style={[styles.badge, styles.aiBadge]}>
            <Text style={styles.badgeText}>{t("provenance.aiAssisted")}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.provenanceNotice} numberOfLines={2}>
        {listing.provenanceNotice}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.price}>{price}</Text>
        <Pressable
          style={styles.installButton}
          onPress={() => onInstall(listing)}
          accessibilityRole="button"
          testID={`install-${listing.id}`}
        >
          <Text style={styles.installText}>{t("marketplace.install")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#8a93a6", marginTop: 12 },
  errorText: { color: "#ff6b6b", textAlign: "center" },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1c2230",
    borderRadius: 8,
  },
  retryText: { color: "#e6e9ef" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#161a22",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: { color: "#ffffff", fontSize: 17, fontWeight: "700" },
  creator: { color: "#8a93a6", fontSize: 13, marginTop: 2 },
  summary: { color: "#c3c9d6", fontSize: 14, marginTop: 8 },
  badgeRow: { flexDirection: "row", marginTop: 10 },
  badge: {
    backgroundColor: "#22304d",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  aiBadge: { backgroundColor: "#3a2a4d" },
  badgeText: { color: "#cdd6ea", fontSize: 11 },
  provenanceNotice: { color: "#6f7892", fontSize: 11, marginTop: 8 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  price: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  installButton: {
    backgroundColor: "#5b8cff",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  installText: { color: "#0b0e14", fontWeight: "700" },
});
