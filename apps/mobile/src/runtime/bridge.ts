/**
 * HOST BRIDGE — the controlled native capability surface exposed to sandboxed creator
 * apps.
 *
 * SECURITY BOUNDARY
 * -----------------
 * Creator apps are untrusted code delivered over-the-air. They never get raw access to
 * the device or to other apps' data. The ONLY way a creator app can touch native
 * capabilities is through an instance of `HostBridge` that the host hands it. Every
 * method here is a deliberate, auditable capability:
 *
 *   - The host decides which capabilities to grant per app (see `AppTemplate.capabilities`
 *     in `@pd/core`). A bridge handed to a "notes" app should have notification/calendar
 *     methods that reject, because that template only declared `storage`.
 *   - Storage is NAMESPACED per `appId`, so one creator app can never read or clobber
 *     another's data. The namespacing happens here, not in the creator app — the creator
 *     app only ever sees its own logical keyspace.
 *   - All inputs crossing the boundary should be validated/sanitized before they reach a
 *     native module. (Stubbed here; in production each method validates with a zod schema.)
 *
 * In the real runtime this object is what gets injected into the sandbox:
 *   - For a WebView bundle: serialized over `postMessage` with a request/response
 *     protocol, so the creator code calls an async proxy and the host executes natively.
 *   - For a Hermes/JS bundle: passed as a frozen object via the runtime's global, with
 *     each method wrapped so it can be revoked when the app is uninstalled.
 */

// --- Capability payload types -------------------------------------------------

export interface ScheduledNotification {
  /** Stable id so the creator app can cancel it later. */
  id: string;
  title: string;
  body: string;
  /** Epoch milliseconds at which to fire. */
  fireAt: number;
}

export interface CalendarEvent {
  title: string;
  /** ISO-8601 start timestamp. */
  start: string;
  /** ISO-8601 end timestamp. */
  end: string;
  notes?: string;
}

export interface WidgetRegistration {
  /** Unique within the app's namespace. */
  widgetId: string;
  /** Human-readable label shown in the host's widget gallery. */
  displayName: string;
  /** Size hint the host uses when laying out the home-screen widget. */
  size: "small" | "medium" | "large";
}

/** The capabilities a creator app declared and the host granted. */
export type Capability = "notifications" | "storage" | "calendar" | "widgets";

// --- The bridge surface -------------------------------------------------------

export interface NotificationsApi {
  /** Schedule a local notification. Resolves once the host has queued it. */
  schedule(notification: ScheduledNotification): Promise<void>;
  /** Cancel a previously scheduled notification by id. */
  cancel(notificationId: string): Promise<void>;
}

export interface StorageApi {
  /** Read a value from this app's private, namespaced keyspace. */
  get(key: string): Promise<string | null>;
  /** Write a value into this app's private, namespaced keyspace. */
  set(key: string, value: string): Promise<void>;
  /** Remove a key from this app's private, namespaced keyspace. */
  remove(key: string): Promise<void>;
}

export interface CalendarApi {
  /** Add an event to the user's calendar (after host-mediated consent). */
  addEvent(event: CalendarEvent): Promise<{ eventId: string }>;
}

export interface WidgetsApi {
  /** Register a home-screen widget the host can render on the app's behalf. */
  registerWidget(registration: WidgetRegistration): Promise<void>;
}

/**
 * The complete, typed bridge handed to a sandboxed app. This interface IS the contract:
 * if it isn't here, a creator app cannot do it.
 */
export interface HostBridge {
  /** The app this bridge is scoped to. Read-only; creator code cannot change it. */
  readonly appId: string;
  /** Capabilities granted to this app instance. */
  readonly capabilities: ReadonlyArray<Capability>;
  readonly notifications: NotificationsApi;
  readonly storage: StorageApi;
  readonly calendar: CalendarApi;
  readonly widgets: WidgetsApi;
}

// --- Factory ------------------------------------------------------------------

/** Thrown when a creator app calls a capability it was not granted. */
export class CapabilityDeniedError extends Error {
  constructor(
    public readonly appId: string,
    public readonly capability: Capability,
  ) {
    super(`App "${appId}" is not permitted to use capability "${capability}".`);
    this.name = "CapabilityDeniedError";
  }
}

/** Build the per-app key used by the underlying (shared) native storage. */
function namespacedKey(appId: string, key: string): string {
  // Every creator app lives under its own prefix so keyspaces can never collide.
  return `app:${appId}:${key}`;
}

/**
 * Create a HostBridge for a given creator app.
 *
 * `granted` controls which capabilities are live; anything not granted throws
 * `CapabilityDeniedError` at call time. In production the native implementations live
 * behind these stubs (expo-notifications, AsyncStorage/SQLite, expo-calendar, the
 * native widget extension). The skeleton ships safe no-ops that preserve the types and
 * the security semantics (namespacing + capability checks) so the wiring is obvious.
 */
export function createHostBridge(
  appId: string,
  granted: ReadonlyArray<Capability> = ["storage"],
): HostBridge {
  const grantedSet = new Set<Capability>(granted);

  function requireCapability(cap: Capability): void {
    if (!grantedSet.has(cap)) {
      throw new CapabilityDeniedError(appId, cap);
    }
  }

  const notifications: NotificationsApi = {
    async schedule(notification) {
      requireCapability("notifications");
      // TODO(native): expo-notifications scheduleNotificationAsync, keyed by id.
      void notification;
    },
    async cancel(notificationId) {
      requireCapability("notifications");
      // TODO(native): expo-notifications cancelScheduledNotificationAsync.
      void notificationId;
    },
  };

  const storage: StorageApi = {
    async get(key) {
      requireCapability("storage");
      // TODO(native): read from AsyncStorage/SQLite at namespacedKey(appId, key).
      void namespacedKey(appId, key);
      return null;
    },
    async set(key, value) {
      requireCapability("storage");
      // TODO(native): write to AsyncStorage/SQLite at namespacedKey(appId, key).
      void namespacedKey(appId, key);
      void value;
    },
    async remove(key) {
      requireCapability("storage");
      // TODO(native): delete namespacedKey(appId, key) from native storage.
      void namespacedKey(appId, key);
    },
  };

  const calendar: CalendarApi = {
    async addEvent(event) {
      requireCapability("calendar");
      // TODO(native): expo-calendar createEventAsync after user consent.
      void event;
      return { eventId: "stub-event-id" };
    },
  };

  const widgets: WidgetsApi = {
    async registerWidget(registration) {
      requireCapability("widgets");
      // TODO(native): persist registration; host renders it in the widget gallery.
      void registration;
    },
  };

  return Object.freeze({
    appId,
    capabilities: [...grantedSet],
    notifications,
    storage,
    calendar,
    widgets,
  });
}
