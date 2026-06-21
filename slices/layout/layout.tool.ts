import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getSocketManager } from "../socket/socket.accessor.js";

export function registerLayoutTools(pi: ExtensionAPI): void {
  // ─── herdr_layout_export ──────────────────────────────
  pi.registerTool({
    name: "herdr_layout_export",
    label: "Herdr Layout Export",
    description: "Export the current herdr layout as JSON. Useful for saving and restoring workspace configurations.",
    promptSnippet: "Export herdr layout",
    promptGuidelines: [
      "Use herdr_layout_export before making major changes to save the current layout.",
      "The exported JSON can be used to restore the layout later.",
    ],
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      try {
        const result = await getSocketManager().sendRequest("layout.export", {});
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });
}