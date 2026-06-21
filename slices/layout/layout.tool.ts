import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getSocketManager, hasSocketManager } from "../socket/socket.accessor.js";

export function registerLayoutTools(pi: ExtensionAPI): void {
  // ─── herdr_layout_export ──────────────────────────────
  pi.registerTool({
    name: "herdr_layout_export",
    label: "Herdr Layout Export",
    description: "Export the current layout configuration as JSON.",
    promptSnippet: "Export layout configuration",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("layout.export", {});
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