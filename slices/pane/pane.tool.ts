import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getSocketManager } from "../socket/socket.accessor.js";

export function registerPaneTools(pi: ExtensionAPI): void {
  // ─── herdr_pane_current ──────────────────────────────
  pi.registerTool({
    name: "herdr_pane_current",
    label: "Herdr Current Pane",
    description: "Get information about the currently focused pane in herdr.",
    promptSnippet: "Get current pane info",
    promptGuidelines: [
      "Use herdr_pane_current to check which pane is active before sending commands.",
    ],
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      try {
        const result = await getSocketManager().sendRequest("pane.current", {});
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });

  // ─── herdr_pane_list ─────────────────────────────────
  pi.registerTool({
    name: "herdr_pane_list",
    label: "Herdr List Panes",
    description: "List all panes in the current herdr session.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      try {
        const result = await getSocketManager().sendRequest("pane.list", {});
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });

  // ─── herdr_pane_send_text ────────────────────────────
  pi.registerTool({
    name: "herdr_pane_send_text",
    label: "Herdr Send Text to Pane",
    description: "Send text or a command to a specific herdr pane. If execute is true, the text is followed by Enter.",
    promptSnippet: "Send command to a herdr pane",
    promptGuidelines: [
      "Use herdr_pane_send_text to run commands in other panes.",
      "Set execute: true to run the command (adds Enter), false to just type text.",
      "After sending a command, use herdr_pane_wait to wait for output, then herdr_pane_read to get the result.",
    ],
    parameters: Type.Object({
      pane_id: Type.String({ description: "Pane ID (e.g., w1:p1)" }),
      text: Type.String({ description: "Text or command to send" }),
      execute: Type.Optional(Type.Boolean({ description: "Execute the command (adds Enter key)", default: true })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        const result = await getSocketManager().sendRequest("pane.send_text", {
          id: params.pane_id,
          text: params.text,
          execute: params.execute ?? true,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });

  // ─── herdr_pane_read ─────────────────────────────────
  pi.registerTool({
    name: "herdr_pane_read",
    label: "Herdr Read Pane Output",
    description: "Read output from a specific herdr pane. Optionally specify number of lines or timeout.",
    promptSnippet: "Read output from a herdr pane",
    promptGuidelines: [
      "Use herdr_pane_read after herdr_pane_wait to get command output.",
      "Specify lines to limit output length, or timeout to wait for output.",
    ],
    parameters: Type.Object({
      pane_id: Type.String({ description: "Pane ID (e.g., w1:p1)" }),
      lines: Type.Optional(Type.Number({ description: "Number of lines to read" })),
      timeout: Type.Optional(Type.Number({ description: "Timeout in milliseconds" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        const requestParams: Record<string, unknown> = { id: params.pane_id };
        if (params.lines !== undefined) requestParams.lines = params.lines;
        if (params.timeout !== undefined) requestParams.timeout = params.timeout;
        const result = await getSocketManager().sendRequest("pane.read", requestParams);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });

  // ─── herdr_pane_wait ─────────────────────────────────
  pi.registerTool({
    name: "herdr_pane_wait",
    label: "Herdr Wait for Pane Output",
    description: "Wait for a specific pattern to appear in a herdr pane's output. Useful for waiting for command completion.",
    promptSnippet: "Wait for pattern in pane output",
    promptGuidelines: [
      "Use herdr_pane_wait after sending a command to wait for specific output patterns like 'PASS', 'FAIL', 'Error', or prompt symbols like '$' or '>'.",
      "Set a reasonable timeout (default 30s) for long-running commands.",
    ],
    parameters: Type.Object({
      pane_id: Type.String({ description: "Pane ID (e.g., w1:p1)" }),
      pattern: Type.String({ description: "Pattern to wait for (plain text or regex)" }),
      timeout: Type.Optional(Type.Number({ description: "Timeout in milliseconds", default: 30000 })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        const result = await getSocketManager().sendRequest("pane.wait_for_output", {
          id: params.pane_id,
          pattern: params.pattern,
          timeout: params.timeout ?? 30000,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });

  // ─── herdr_pane_split ────────────────────────────────
  pi.registerTool({
    name: "herdr_pane_split",
    label: "Herdr Split Pane",
    description: "Split a pane horizontally or vertically. If no pane_id is specified, splits the current pane.",
    parameters: Type.Object({
      pane_id: Type.Optional(Type.String({ description: "Pane ID to split (default: current pane)" })),
      direction: Type.String({ description: "Split direction: 'horizontal' or 'vertical'" }),
      size: Type.Optional(Type.Number({ description: "Size of the new pane in percentage or rows/cols" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        const requestParams: Record<string, unknown> = { direction: params.direction };
        if (params.pane_id) requestParams.id = params.pane_id;
        if (params.size !== undefined) requestParams.size = params.size;
        const result = await getSocketManager().sendRequest("pane.split", requestParams);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], details: { result } };
      } catch (err: any) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], details: { error: err.message } };
      }
    },
  });
}