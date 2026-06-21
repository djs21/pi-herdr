# 🔌 pi-herdr

> **Herdr Socket API Integration** for the [pi coding agent](https://github.com/earendil-works/pi-coding-agent)

**pi-herdr** is a Pi extension that exposes herdr's Socket API as custom tools, allowing your pi coding agent to control herdr terminal workspace manager — send commands to panes, read output, navigate workspaces, split panes, send key combos, and export layouts.

---

## ✨ Features

| Feature | What it does |
|---------|-------------|
| 🔗 **Socket Connection** | Auto-connects to herdr Unix socket on session start |
| 📍 **Pane Awareness** | Know which pane is active, list all panes |
| ⌨️ **Send Commands** | Run commands in any pane with `herdr_pane_send_text` |
| 📖 **Read Output** | Read pane output with `herdr_pane_read` |
| ⏳ **Wait for Output** | Wait for patterns with `herdr_pane_wait` |
| ✂️ **Split Panes** | Split panes horizontally or vertically |
| 🗂️ **Workspace Management** | List and focus workspaces |
| 🔑 **Key Combos** | Send ctrl+c, ctrl+d, and more |
| 💾 **Layout Export** | Export layout as JSON |
| 🧠 **Skill Layer** | SKILL.md guides the agent on best practices |

---

## 🚀 Quick Start

```bash
# Add to your Pi project
git submodule add git@github-pribadi:djs21/pi-herdr.git extensions/pi-herdr
```

That's it. The extension auto-discovers and connects to herdr on session start.

---

## 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| `herdr_connect` | Connect to herdr socket |
| `herdr_disconnect` | Disconnect from herdr socket |
| `herdr_pane_current` | Get current focused pane info |
| `herdr_pane_list` | List all panes |
| `herdr_pane_send_text` | Send text/command to a pane |
| `herdr_pane_read` | Read output from a pane |
| `herdr_pane_wait` | Wait for a pattern in pane output |
| `herdr_pane_split` | Split a pane (horizontal/vertical) |
| `herdr_workspace_list` | List all workspaces |
| `herdr_workspace_focus` | Focus a specific workspace |
| `herdr_send_keys` | Send key combos to a pane |
| `herdr_layout_export` | Export current layout as JSON |

---

## 🧬 Architecture

Vertical slice architecture (like crew-of-pi):

```
pi-herdr/
├── index.ts                  # Entry point — wires all slices
├── shared/types.ts           # Cross-slice type contracts
├── slices/
│   ├── socket/               # SocketManager (connect, sendRequest, etc.)
│   ├── pane/                 # Pane tools (6 tools)
│   ├── workspace/            # Workspace tools (2 tools)
│   ├── keys/                 # Keys tools (1 tool)
│   ├── layout/               # Layout tools (1 tool)
│   └── events/               # Event subscriptions
├── skill/SKILL.md            # Agent skill guide
└── prompts/                  # Workflow templates
```

---

## 🔌 Socket Protocol

- **Transport**: Unix Domain Socket (`node:net`)
- **Format**: Newline-delimited JSON (NDJSON)
- **Socket Path**: `~/.config/herdr/herdr.sock` (or `HERDR_SOCKET_PATH` env)

---

## 🧪 Development

```bash
cd extensions/pi-herdr
bd ready              # Find available work
bd show <id>          # View issue details
bd close <id>         # Complete work
```

---

## 📜 License

MIT — go wild, fork it, remix it, ship it.