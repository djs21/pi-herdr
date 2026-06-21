# slices/ — Vertical Slice Architecture

## Purpose

Each slice is a self-contained domain feature. Slices communicate only through shared types and the SocketManager accessor.

## Ownership

| Slice | Owner | Files |
|-------|-------|-------|
| **socket** | SocketManager | socket.types.ts, socket.manager.ts, socket.accessor.ts, socket.tool.ts |
| **pane** | Pane tools | pane.tool.ts |
| **workspace** | Workspace tools | workspace.tool.ts |
| **keys** | Keys tools | keys.tool.ts |
| **layout** | Layout tools | layout.tool.ts |
| **events** | Event subscriptions | events.ts |

## Local Contracts

- Every slice registers tools via `register*Tools(pi: ExtensionAPI)` export
- Every slice imports from `../socket/socket.accessor.js` (never instantiate its own SocketManager)
- Tools must handle the "not connected" error gracefully

## Child DOX Index

### Direct Children

| Child | Path | Scope |
|-------|------|-------|
| socket/ | `socket/` | SocketManager implementation |
| pane/ | `pane/` | Pane tools |
| workspace/ | `workspace/` | Workspace tools |
| keys/ | `keys/` | Keys tools |
| layout/ | `layout/` | Layout tools |
| events/ | `events/` | Event subscriptions |

### DOX Tree

```
slices/AGENTS.md
├── socket/               — SocketManager implementation
│   ├── socket.types.ts   — Type definitions
│   ├── socket.manager.ts — Manager class
│   ├── socket.accessor.ts — Singleton accessor
│   └── socket.tool.ts    — Registration function
├── pane/                 — Pane tools
│   └── pane.tool.ts      — 6 pane tools
├── workspace/            — Workspace tools
│   └── workspace.tool.ts — 2 workspace tools
├── keys/                 — Keys tools
│   └── keys.tool.ts      — 1 keys tool
├── layout/               — Layout tools
│   └── layout.tool.ts    — 1 layout tool
└── events/               — Event subscriptions
    └── events.ts         — Subscription management
```