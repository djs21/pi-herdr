import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getSocketManager, hasSocketManager } from "../socket/socket.accessor.js";

export function registerKeysTools(pi: ExtensionAPI): void {
  // ─── herdr_send_keys ────────────────────────────────
  pi.registerTool({
    name: "herdr_send_keys",
    label: "Herdr Send Keys",
    description: "Send keystrokes to a pane.",
    promptSnippet: "Send keystrokes to a pane",
    parameters: Type.Object({
      pane_id: Type.String({ description: "ID of the pane to send keys to" }),
      keys: Type.Array(Type.String({ description: "Array of key strings to send" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("pane.send_keys", {
          id: params.pane_id,
          keys: params.keys,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          details: { result },
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err.message }, null, 2) }],
          details: { error: err.message },
        };
      }
    },
  });
}