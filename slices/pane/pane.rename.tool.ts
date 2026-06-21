import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getSocketManager } from "../socket/socket.accessor.js";

export function registerPaneRenameTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "herdr_pane_rename",
    label: "Herdr Rename Pane",
    description: "Rename (label) a herdr pane. Pass a label string to set, or null/empty to clear the label.",
    parameters: Type.Object({
      pane_id: Type.String({ description: "Pane ID to rename (e.g., w1:p1)" }),
      label: Type.Optional(Type.String({ description: "New label text. Omit or pass empty string to clear." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        const requestParams: Record<string, unknown> = { id: params.pane_id };
        // If label is provided, set it. If omitted or empty, clear it.
        requestParams.label = params.label || null;
        const result = await getSocketManager().sendRequest("pane.rename", requestParams);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });
}