import { SocketState, SocketConfig, PendingRequest } from "../../shared/types.js";

export { SocketState, SocketConfig, PendingRequest };

export interface SocketManager {
  readonly state: SocketState;
  readonly config: SocketConfig | null;
  connect(config?: SocketConfig): Promise<HerdrConnectionResult>;
  disconnect(): void;
  sendRequest(method: string, params?: Record<string, unknown>): Promise<unknown>;
}

export interface HerdrConnectionResult {
  success: boolean;
  state: SocketState;
  error?: string;
  socketPath?: string;
}