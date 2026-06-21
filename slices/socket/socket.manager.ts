import * as net from "node:net";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";
import {
  SocketState,
  SocketConfig,
  PendingRequest,
  HerdrRequest,
  HerdrResponse,
} from "../../shared/types.js";
import type { SocketManager, HerdrConnectionResult } from "./socket.types.js";

export class HerdrSocketManager implements SocketManager {
  private _state: SocketState = SocketState.Disconnected;
  private _config: SocketConfig | null = null;
  private _socket: net.Socket | null = null;
  private _pendingRequests = new Map<string, PendingRequest>();
  private _requestCounter = 0;
  private _buffer = "";

  get state(): SocketState {
    return this._state;
  }

  get config(): SocketConfig | null {
    return this._config;
  }

  /**
   * Discover socket path with priority:
   * 1. Provided config.socketPath
   * 2. HERDR_SOCKET_PATH env var
   * 3. Provided config.sessionName → ~/.config/herdr/sessions/<name>/herdr.sock
   * 4. HERDR_SESSION env var → ~/.config/herdr/sessions/<name>/herdr.sock
   * 5. Default: ~/.config/herdr/herdr.sock
   */
  discoverSocketPath(config?: SocketConfig): SocketConfig {
    if (config?.socketPath) return config;

    const envPath = process.env.HERDR_SOCKET_PATH;
    if (envPath) return { socketPath: envPath };

    const herdrDir = path.join(os.homedir(), ".config", "herdr");

    const sessionName = config?.sessionName || process.env.HERDR_SESSION;
    if (sessionName) {
      const sessionPath = path.join(herdrDir, "sessions", sessionName, "herdr.sock");
      if (fs.existsSync(sessionPath)) {
        return { socketPath: sessionPath, sessionName };
      }
    }

    return { socketPath: path.join(herdrDir, "herdr.sock") };
  }

  async connect(config?: SocketConfig): Promise<HerdrConnectionResult> {
    if (this._state === SocketState.Connected) {
      return { success: true, state: this._state, socketPath: this._config?.socketPath };
    }

    this._state = SocketState.Connecting;
    const resolvedConfig = this.discoverSocketPath(config);

    return new Promise((resolve) => {
      try {
        // Check if socket file exists
        if (!fs.existsSync(resolvedConfig.socketPath)) {
          this._state = SocketState.Error;
          resolve({
            success: false,
            state: this._state,
            error: `Socket not found: ${resolvedConfig.socketPath}. Is herdr running?`,
          });
          return;
        }

        const sock = new net.Socket();
        this._socket = sock;

        sock.on("connect", () => {
          this._state = SocketState.Connected;
          this._config = resolvedConfig;
          resolve({
            success: true,
            state: this._state,
            socketPath: resolvedConfig.socketPath,
          });
        });

        sock.on("data", (data: Buffer) => {
          this._buffer += data.toString();
          this.processBuffer();
        });

        sock.on("close", () => {
          this._state = SocketState.Disconnected;
          this._socket = null;
          // Don't reject pending — they were already resolved before close
          this._pendingRequests.clear();
          this._buffer = "";
        });

        sock.on("error", (err: Error) => {
          this._state = SocketState.Error;
          resolve({
            success: false,
            state: this._state,
            error: `Socket error: ${err.message}`,
          });
        });

        sock.connect(resolvedConfig.socketPath);

        // Timeout
        setTimeout(() => {
          if (this._state === SocketState.Connecting) {
            sock.destroy();
            this._state = SocketState.Error;
            resolve({
              success: false,
              state: this._state,
              error: "Connection timeout",
            });
          }
        }, 5000);
      } catch (err: any) {
        this._state = SocketState.Error;
        resolve({
          success: false,
          state: this._state,
          error: `Failed to connect: ${err.message}`,
        });
      }
    });
  }

  disconnect(): void {
    this._socket?.destroy();
    this._socket = null;
    this._state = SocketState.Disconnected;
    this.rejectAllPending("Disconnected");
    this._buffer = "";
  }

  async sendRequest(method: string, params?: Record<string, unknown>): Promise<unknown> {
    // Auto-reconnect if disconnected
    if (this._state === SocketState.Disconnected || !this._socket) {
      if (this._config) {
        const result = await this.connect(this._config);
        if (!result.success) {
          throw new Error(result.error || "Failed to reconnect to herdr");
        }
      } else {
        // Try default path
        const result = await this.connect();
        if (!result.success) {
          throw new Error(result.error || "Failed to connect to herdr");
        }
      }
    }

    if (this._state !== SocketState.Connected || !this._socket) {
      throw new Error("Not connected to herdr. Call herdr_connect first.");
    }

    const id = `req_${Date.now()}_${++this._requestCounter}`;
    const request: HerdrRequest = { id, method, params };

    return new Promise((resolve, reject) => {
      const pending: PendingRequest = { id, resolve, reject };

      // 30-second timeout
      pending.timer = setTimeout(() => {
        this._pendingRequests.delete(id);
        reject(new Error(`Request timed out: ${method}`));
      }, 30000);

      this._pendingRequests.set(id, pending);
      this._socket!.write(JSON.stringify(request) + "\n");
    });
  }

  private processBuffer(): void {
    const lines = this._buffer.split("\n");
    // Keep the last potentially incomplete line in buffer
    this._buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const response: HerdrResponse = JSON.parse(line);
        const pending = this._pendingRequests.get(response.id);
        if (pending) {
          clearTimeout(pending.timer);
          this._pendingRequests.delete(response.id);

          if ("error" in response) {
            pending.reject(new Error(`Herdr error: ${response.error.message}`));
          } else {
            pending.resolve(response.result);
          }
        }
      } catch {
        // Malformed JSON line - ignore
      }
    }
  }

  private rejectAllPending(reason: string): void {
    for (const [id, pending] of this._pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error(reason));
    }
    this._pendingRequests.clear();
  }
}