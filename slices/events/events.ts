import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getSocketManager, hasSocketManager } from "../socket/socket.accessor.js";

let subscribed = false;
let _eventRequestId: string | null = null;

/**
 * Subscribe to herdr events. This keeps the connection open (persistent).
 * Herdr docs: "Event subscriptions keep the connection open after the initial response."
 * 
 * Called on session_start after connection.
 */
export async function subscribeToEvents(): Promise<void> {
  if (!hasSocketManager() || subscribed) return;
  try {
    const result = await getSocketManager().sendRequest("events.subscribe", {
      subscriptions: [
        { type: "pane.focused" },
        { type: "workspace.focused" },
        { type: "pane.exited" },
        { type: "pane.agent_status_changed" },
      ],
    });
    subscribed = true;
    // Store the subscription request ID for cleanup
    if (result && typeof result === "object" && "id" in result) {
      _eventRequestId = (result as any).id;
    }
  } catch {
    // Silently fail — events subscription is optional
  }
}

export function isSubscribed(): boolean {
  return subscribed;
}

export function resetSubscription(): void {
  subscribed = false;
  _eventRequestId = null;
}