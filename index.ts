/**
 * pi-herdr: Herdr Socket API Extension for Pi Coding Agent
 *
 * Entry point — imports & mounts all vertical slices.
 * Each slice is self-contained. To add/remove a feature, add/remove one import.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { HerdrSocketManager } from "./slices/socket/socket.manager.js";
import { setSocketManager, hasSocketManager, getSocketManager } from "./slices/socket/socket.accessor.js";
import { registerSocketTools } from "./slices/socket/socket.tool.js";
import { registerPaneTools } from "./slices/pane/pane.tool.js";
import { registerWorkspaceTools } from "./slices/workspace/workspace.tool.js";
import { registerKeysTools } from "./slices/keys/keys.tool.js";
import { registerLayoutTools } from "./slices/layout/layout.tool.js";
import { subscribeToEvents, resetSubscription } from "./slices/events/events.js";

// ─── Slices (lazy imports — expanded as slices are implemented) ──

export default function (pi: ExtensionAPI) {
  // ─── Init: Session Start ───────────────────────────────
  pi.on("session_start", async (_event, ctx) => {
    // Auto-discover and connect to herdr socket
    const manager = new HerdrSocketManager();
    try {
      const result = await manager.connect();
      if (result.success) {
        setSocketManager(manager);
        ctx.ui.notify(`🔌 Connected to herdr (${result.socketPath})`, "info");
        subscribeToEvents(ctx);
      } else {
        ctx.ui.notify(`⚠️ Herdr not available: ${result.error}`, "warning");
      }
    } catch (err: any) {
      ctx.ui.notify(`⚠️ Herdr connection failed: ${err.message}`, "warning");
    }
  });

  // ─── Init: Session Shutdown ───────────────────────────
  pi.on("session_shutdown", async (_event, _ctx) => {
    if (hasSocketManager()) {
      getSocketManager().disconnect();
    }
    resetSubscription();
  });

  // ─── Register Tools ───────────────────────────────────
  registerSocketTools(pi);
  registerPaneTools(pi);
  registerWorkspaceTools(pi);
  registerKeysTools(pi);
  registerLayoutTools(pi);
}