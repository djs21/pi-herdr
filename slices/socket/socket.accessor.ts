import type { SocketManager } from "./socket.types.js";

let _instance: SocketManager | null = null;

export function getSocketManager(): SocketManager {
  if (!_instance) {
    throw new Error("SocketManager not initialized. Call setSocketManager first.");
  }
  return _instance;
}

export function setSocketManager(instance: SocketManager): void {
  _instance = instance;
}

export function hasSocketManager(): boolean {
  return _instance !== null;
}