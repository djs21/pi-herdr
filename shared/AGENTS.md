# shared/ — Cross-Slice Type Contracts

## Purpose

Centralized type definitions shared across all slices. Avoids circular dependencies and ensures consistent API contracts.

## Ownership

| Type | Used By |
|------|---------|
| SocketState, SocketConfig, PendingRequest | socket slice |
| HerdrRequest, HerdrResponse | socket manager |
| PaneInfo, PaneSendOptions, PaneReadOptions, PaneWaitOptions | pane tools |
| WorkspaceInfo, TabInfo | workspace tools |
| SplitDirection | pane split |
| KeyCombo | keys tools |
| LayoutExport | layout tools |
| HerdrToolResult | all tools |

## Child DOX Index

No subdirectories under shared/ have their own AGENTS.md files.