/**
 * Minimal local type shim for `react-native`.
 *
 * The full `react-native` package ships its own (large) types, but this SKELETON is
 * intended to typecheck WITHOUT those types installed. We therefore declare just the
 * handful of RN exports the host app actually uses. When the real `react-native` types
 * are present at build time, those win (this file lives in the app's own `src/types`
 * and only fills the gap during the skeleton phase).
 *
 * Keep this list in sync with the imports used under `src/`.
 */
declare module "react-native" {
  import type * as React from "react";

  // --- Style primitives -----------------------------------------------------
  // RN styles are a structural superset of CSS-ish keys. We keep this loose on
  // purpose: a precise StyleSheet type belongs to the real RN types, not the shim.
  export type StyleProp = Record<string, unknown> | Array<unknown> | false | null | undefined;

  export interface ViewStyle extends Record<string, unknown> {}
  export interface TextStyle extends Record<string, unknown> {}

  // --- Common prop bags -----------------------------------------------------
  export interface ViewProps {
    style?: StyleProp;
    children?: React.ReactNode;
    testID?: string;
  }

  export interface TextProps {
    style?: StyleProp;
    children?: React.ReactNode;
    numberOfLines?: number;
    testID?: string;
  }

  export interface ScrollViewProps extends ViewProps {
    contentContainerStyle?: StyleProp;
    horizontal?: boolean;
  }

  export interface PressableProps {
    style?: StyleProp;
    children?: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    testID?: string;
    accessibilityRole?: string;
  }

  export interface SafeAreaViewProps extends ViewProps {}

  /** Image source: a remote URI bag or a (bundler-provided) static asset id. */
  export type ImageSourcePropType = { uri: string } | number;

  export interface ImageProps {
    source: ImageSourcePropType;
    style?: StyleProp;
    resizeMode?: "cover" | "contain" | "stretch" | "center" | "repeat";
    accessibilityLabel?: string;
    testID?: string;
  }

  export interface FlatListProps<ItemT> {
    data: ReadonlyArray<ItemT> | null | undefined;
    renderItem: (info: { item: ItemT; index: number }) => React.ReactElement | null;
    keyExtractor?: (item: ItemT, index: number) => string;
    style?: StyleProp;
    contentContainerStyle?: StyleProp;
    ListHeaderComponent?: React.ReactElement | null;
    ListEmptyComponent?: React.ReactElement | null;
    refreshing?: boolean;
    onRefresh?: () => void;
  }

  // --- Components -----------------------------------------------------------
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const Image: React.ComponentType<ImageProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const Pressable: React.ComponentType<PressableProps>;
  export const SafeAreaView: React.ComponentType<SafeAreaViewProps>;
  export const ActivityIndicator: React.ComponentType<{ size?: "small" | "large"; color?: string }>;
  export function FlatList<ItemT>(props: FlatListProps<ItemT>): React.ReactElement | null;

  // --- StyleSheet -----------------------------------------------------------
  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle>>(styles: T): T;
    flatten(style: StyleProp): Record<string, unknown>;
    readonly hairlineWidth: number;
    readonly absoluteFillObject: ViewStyle;
  };

  // --- Linking (used to open web checkout / billing) ------------------------
  export const Linking: {
    openURL(url: string): Promise<void>;
    canOpenURL(url: string): Promise<boolean>;
  };
}

/** Expo entry-point registration shim (registerRootComponent). */
declare module "expo" {
  import type * as React from "react";
  export function registerRootComponent(component: React.ComponentType<unknown>): void;
}
