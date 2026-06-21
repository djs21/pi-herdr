import type { Type } from "typebox";

// ─── Socket ──────────────────────────────────────────────
export enum SocketState {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  Error = "error",
}

export interface SocketConfig {
  socketPath: string;
  sessionName?: string;
}

export interface PendingRequest {
  id: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timer?: NodeJS.Timeout;
}

// ─── Herdr Protocol ──────────────────────────────────────
export interface HerdrRequest {
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

export interface HerdrSuccessResponse {
  id: string;
  result: unknown;
}

export interface HerdrErrorResponse {
  id: string;
  error: {
    code: string;
    message: string;
  };
}

export type HerdrResponse = HerdrSuccessResponse | HerdrErrorResponse;

// ─── Domain Types ────────────────────────────────────────
export interface PaneInfo {
  pane_id: string;
  title?: string;
  cwd?: string;
  focused: boolean;
  workspace_id?: string;
  tab_id?: string;
  agent_status?: string;
  revision?: number;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  tabs?: TabInfo[];
  active?: boolean;
}

export interface TabInfo {
  id: string;
  title?: string;
  panes?: PaneInfo[];
  active?: boolean;
}

export type SplitDirection = "horizontal" | "vertical";

export interface PaneSendOptions {
  pane_id: string;
  text: string;
  execute?: boolean;
}

export interface PaneReadOptions {
  pane_id: string;
  lines?: number;
  timeout?: number;
}

export interface PaneWaitOptions {
  pane_id: string;
  pattern: string;
  timeout?: number;
}

export interface KeyCombo {
  keys: string[];
}

export interface LayoutExport {
  json: Record<string, unknown>;
}

// ─── Tool Result ─────────────────────────────────────────
export interface HerdrToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}