/**
 * AccountScreen — subscription / plan info and billing entry point.
 *
 * IMPORTANT BUSINESS RULE: subscriptions are sold via WEB checkout (Stripe), not through
 * in-app purchase. This avoids the 15–30% App Store / Play Store cut. The mobile host
 * therefore never collects payment in-app; "Manage subscription" opens the web billing
 * portal in the system browser via `Linking`.
 */
import * as React from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PLANS, type PlanId, formatMoney, makeT, money } from "@pd/core";

import { ROUTES } from "../config";

const t = makeT("en");

export interface AccountScreenProps {
  /** The user's current plan. Defaults to free for the skeleton. */
  currentPlanId?: PlanId;
}

export function AccountScreen(props: AccountScreenProps): React.ReactElement {
  const { currentPlanId = "free" } = props;
  const currentPlan = PLANS[currentPlanId];

  const openBilling = React.useCallback(() => {
    // Fire-and-forget; the OS opens the URL in the browser. Errors are swallowed because
    // the skeleton has no toast surface yet.
    void Linking.openURL(ROUTES.billingPortal()).catch(() => undefined);
  }, []);

  function priceLabel(planId: PlanId): string {
    const plan = PLANS[planId];
    if (plan.priceMinor === 0) {
      return planId === "enterprise" ? "Custom pricing" : "Free";
    }
    return `${formatMoney(money(plan.priceMinor, plan.currency))} / month`;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Your subscription</Text>

      <View style={styles.card}>
        <Text style={styles.planName}>{t(planNameKey(currentPlan.id))}</Text>
        <Text style={styles.planPrice}>{priceLabel(currentPlan.id)}</Text>
        <View style={styles.limits}>
          <Text style={styles.limitLine}>
            {currentPlan.limits.generationsPerMonth} AI generations / month
          </Text>
          <Text style={styles.limitLine}>
            Up to {currentPlan.limits.maxPublishedApps} published apps
          </Text>
          <Text style={styles.limitLine}>
            Max model tier: {currentPlan.limits.maxModelTier}
          </Text>
          <Text style={styles.limitLine}>
            {currentPlan.limits.canSell ? "Can sell on the marketplace" : "Cannot sell yet"}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.manageButton}
        onPress={openBilling}
        accessibilityRole="button"
        testID="manage-subscription"
      >
        <Text style={styles.manageText}>Manage subscription</Text>
      </Pressable>

      <Text style={styles.note}>
        Subscriptions are handled on the web to keep them store-fee-free. Tapping
        "Manage subscription" opens secure billing in your browser; nothing is charged
        inside this app.
      </Text>

      <Text style={styles.sectionTitle}>All plans</Text>
      {(Object.keys(PLANS) as PlanId[]).map((id) => (
        <View key={id} style={styles.planRow}>
          <Text style={styles.planRowName}>{t(planNameKey(id))}</Text>
          <Text style={styles.planRowPrice}>{priceLabel(id)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

/** Map a PlanId to its i18n name key (kept narrow so `t()` stays typed). */
function planNameKey(id: PlanId) {
  return `plan.${id}.name` as const;
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  sectionTitle: {
    color: "#8a93a6",
    fontSize: 13,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 10,
  },
  card: { backgroundColor: "#161a22", borderRadius: 12, padding: 18 },
  planName: { color: "#ffffff", fontSize: 22, fontWeight: "700" },
  planPrice: { color: "#5b8cff", fontSize: 16, marginTop: 4 },
  limits: { marginTop: 14 },
  limitLine: { color: "#c3c9d6", fontSize: 14, marginTop: 4 },
  manageButton: {
    backgroundColor: "#5b8cff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  manageText: { color: "#0b0e14", fontWeight: "700", fontSize: 15 },
  note: { color: "#8a93a6", fontSize: 12, lineHeight: 18, marginTop: 12 },
  planRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#13171f",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  planRowName: { color: "#e6e9ef", fontSize: 15 },
  planRowPrice: { color: "#8a93a6", fontSize: 14 },
});
