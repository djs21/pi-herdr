import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getSocketManager, hasSocketManager } from "../socket/socket.accessor.js";

let subscribed = false;

export async function subscribeToEvents(ctx: any): Promise<void> {
  if (!hasSocketManager() || subscribed) return;
  try {
    await getSocketManager().sendRequest("events.subscribe", {
      events: ["pane.focused", "workspace.focused", "pane.exited"],
    });
    subscribed = true;
  } catch {
    // Silently fail — events are optional
  }
}

export function isSubscribed(): boolean {
  return subscribed;
}

export function resetSubscription(): void {
  subscribed = false;
}