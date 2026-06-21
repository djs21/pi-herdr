import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getSocketManager, hasSocketManager } from "../socket/socket.accessor.js";

export function registerWorkspaceTools(pi: ExtensionAPI): void {
  // ─── herdr_workspace_list ─────────────────────────────
  pi.registerTool({
    name: "herdr_workspace_list",
    label: "Herdr Workspace List",
    description: "List all workspaces.",
    promptSnippet: "List all workspaces",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("workspace.list", {});
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

  // ─── herdr_workspace_focus ────────────────────────────
  pi.registerTool({
    name: "herdr_workspace_focus",
    label: "Herdr Workspace Focus",
    description: "Focus on a specific workspace.",
    promptSnippet: "Focus on a workspace",
    parameters: Type.Object({
      workspace_id: Type.String({ description: "ID of the workspace to focus" }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("workspace.focus", {
          id: params.workspace_id,
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