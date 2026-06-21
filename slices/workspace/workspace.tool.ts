import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getSocketManager } from "../socket/socket.accessor.js";

export function registerWorkspaceTools(pi: ExtensionAPI): void {
  // ─── herdr_workspace_list ────────────────────────────
  pi.registerTool({
    name: "herdr_workspace_list",
    label: "Herdr List Workspaces",
    description: "List all workspaces in the current herdr session.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      try {
        const result = await getSocketManager().sendRequest("workspace.list", {});
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });

  // ─── herdr_workspace_focus ───────────────────────────
  pi.registerTool({
    name: "herdr_workspace_focus",
    label: "Herdr Focus Workspace",
    description: "Focus a specific herdr workspace by ID.",
    parameters: Type.Object({
      workspace_id: Type.String({ description: "Workspace ID (e.g., w1, w2)" }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        const result = await getSocketManager().sendRequest("workspace.focus", {
          id: params.workspace_id,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });
}