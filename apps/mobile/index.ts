/**
 * Expo entry point. Registers the root React component with the native runtime.
 *
 * `registerRootComponent` is Expo's wrapper around React Native's `AppRegistry`; it
 * also sets up the dev-client / OTA update plumbing. In the skeleton we model the
 * function via the local `expo` type shim (see src/types/react-native.d.ts).
 */
import { registerRootComponent } from "expo";

import { App } from "./src/App";

registerRootComponent(App);
