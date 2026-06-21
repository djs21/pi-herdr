import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getSocketManager, hasSocketManager } from "../socket/socket.accessor.js";

export function registerPaneTools(pi: ExtensionAPI): void {
  // ─── herdr_pane_current ───────────────────────────────
  pi.registerTool({
    name: "herdr_pane_current",
    label: "Herdr Pane Current",
    description: "Get information about the currently focused pane.",
    promptSnippet: "Get current pane info",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("pane.current", {});
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

  // ─── herdr_pane_list ────────────────────────────────
  pi.registerTool({
    name: "herdr_pane_list",
    label: "Herdr Pane List",
    description: "List all panes in the current workspace.",
    promptSnippet: "List all panes",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("pane.list", {});
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

  // ─── herdr_pane_send_text ───────────────────────────
  pi.registerTool({
    name: "herdr_pane_send_text",
    label: "Herdr Pane Send Text",
    description: "Send text to a pane for execution.",
    promptSnippet: "Send text to a pane",
    parameters: Type.Object({
      pane_id: Type.String({ description: "ID of the pane to send text to" }),
      text: Type.String({ description: "Text to send to the pane" }),
      execute: Type.Optional(Type.Boolean({ description: "Whether to execute the text as a command" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("pane.send_text", {
          id: params.pane_id,
          text: params.text,
          execute: params.execute,
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

  // ─── herdr_pane_read ──────────────────────────────────
  pi.registerTool({
    name: "herdr_pane_read",
    label: "Herdr Pane Read",
    description: "Read output from a pane.",
    promptSnippet: "Read output from a pane",
    parameters: Type.Object({
      pane_id: Type.String({ description: "ID of the pane to read from" }),
      lines: Type.Optional(Type.Number({ description: "Number of lines to read" })),
      timeout: Type.Optional(Type.Number({ description: "Timeout in milliseconds" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("pane.read", {
          id: params.pane_id,
          lines: params.lines,
          timeout: params.timeout,
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

  // ─── herdr_pane_wait ────────────────────────────────
  pi.registerTool({
    name: "herdr_pane_wait",
    label: "Herdr Pane Wait",
    description: "Wait for specific output pattern in a pane.",
    promptSnippet: "Wait for output pattern in a pane",
    parameters: Type.Object({
      pane_id: Type.String({ description: "ID of the pane to wait on" }),
      pattern: Type.String({ description: "Pattern to wait for in output" }),
      timeout: Type.Optional(Type.Number({ description: "Timeout in milliseconds" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("pane.wait_for_output", {
          id: params.pane_id,
          pattern: params.pattern,
          timeout: params.timeout,
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

  // ─── herdr_pane_split ───────────────────────────────
  pi.registerTool({
    name: "herdr_pane_split",
    label: "Herdr Pane Split",
    description: "Split a pane horizontally or vertically.",
    promptSnippet: "Split a pane",
    parameters: Type.Object({
      pane_id: Type.String({ description: "ID of the pane to split" }),
      direction: Type.String({ description: "Split direction: horizontal or vertical" }),
      size: Type.Optional(Type.Number({ description: "Size of the new pane" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        if (!hasSocketManager()) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Not connected to herdr. Call herdr_connect first." }, null, 2) }],
            details: { error: "Not connected" },
          };
        }
        const result = await getSocketManager().sendRequest("pane.split", {
          id: params.pane_id,
          direction: params.direction,
          size: params.size,
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