import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { HerdrSocketManager } from "./socket.manager.js";
import { setSocketManager, getSocketManager, hasSocketManager } from "./socket.accessor.js";
import { SocketState } from "../../shared/types.js";

export function registerSocketTools(pi: ExtensionAPI): void {
  // ─── herdr_connect ──────────────────────────────────
  pi.registerTool({
    name: "herdr_connect",
    label: "Herdr Connect",
    description: "Connect to the herdr Unix socket. Auto-discovers socket path from HERDR_SOCKET_PATH env, HERDR_SESSION env, or defaults to ~/.config/herdr/herdr.sock.",
    promptSnippet: "Connect to herdr terminal workspace manager",
    promptGuidelines: [
      "Use herdr_connect before any other herdr tool to establish a connection to the herdr socket.",
      "If connection fails, check that herdr is running and the socket path is correct.",
    ],
    parameters: Type.Object({
      session: Type.Optional(Type.String({ description: "Named herdr session to connect to" })),
      socketPath: Type.Optional(Type.String({ description: "Custom socket path (overrides auto-discovery)" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const manager = new HerdrSocketManager();
      const result = await manager.connect({
        sessionName: params.session,
        socketPath: params.socketPath,
      });
      if (result.success) {
        setSocketManager(manager);
      }
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: { result },
      };
    },
  });

  // ─── herdr_disconnect ───────────────────────────────
  pi.registerTool({
    name: "herdr_disconnect",
    label: "Herdr Disconnect",
    description: "Disconnect from the herdr socket.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      if (hasSocketManager()) {
        getSocketManager().disconnect();
      }
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, state: "disconnected" }, null, 2) }],
        details: { success: true },
      };
    },
  });
}