import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getSocketManager } from "../socket/socket.accessor.js";

export function registerKeysTools(pi: ExtensionAPI): void {
  // ─── herdr_send_keys ─────────────────────────────────
  pi.registerTool({
    name: "herdr_send_keys",
    label: "Herdr Send Keys",
    description: "Send key combinations to a herdr pane. Supports ctrl+c, ctrl+d, alt+x, enter, esc, tab, f1-f12, etc.",
    promptSnippet: "Send key combos to a herdr pane",
    promptGuidelines: [
      "Use herdr_send_keys to interrupt processes (ctrl+c), navigate (ctrl+d), or send special keys.",
      "Pass keys as an array: ['ctrl+c'], ['ctrl+d'], ['alt+x'], ['enter'].",
    ],
    parameters: Type.Object({
      pane_id: Type.String({ description: "Pane ID (e.g., w1:p1)" }),
      keys: Type.Array(Type.String(), { description: "Array of key combos (e.g., ['ctrl+c'], ['ctrl+d', 'enter'])" }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        const result = await getSocketManager().sendRequest("pane.send_keys", {
          id: params.pane_id,
          keys: params.keys,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });
}