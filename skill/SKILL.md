---
name: pi-herdr
description: Control herdr terminal workspace manager from pi coding agent. Connect to herdr socket, manage panes/workspaces, send commands, read output, send key combos, split panes, and export layouts. Use when running pi inside herdr and need to interact with the terminal environment.
---

# pi-herdr — Herdr Integration for Pi

This skill teaches pi how to use herdr custom tools to control the terminal workspace manager.

## Prerequisites

- Herdr must be running
- The `pi-herdr` extension must be loaded

## Quick Start

### 1. Connect to Herdr

```bash
# Auto-connect happens on session_start, but you can also manually connect:
herdr_connect
```

### 2. Check Your Current Pane

```bash
herdr_pane_current
```

### 3. Send a Command and Read Output (3-Step Pattern)

Always follow this pattern when you need to interact with a pane:

```
Step 1: herdr_pane_send_text({ pane_id: "w1:p1", text: "npm test", execute: true })
Step 2: herdr_pane_wait({ pane_id: "w1:p1", pattern: "PASS|FAIL|Error" })
Step 3: herdr_pane_read({ pane_id: "w1:p1" })
```

### 4. Interrupt a Running Process

```bash
herdr_send_keys({ pane_id: "w1:p1", keys: ["ctrl+c"] })
```

### 5. Save Layout Before Experiments

```bash
herdr_layout_export
```

## Best Practices

- **Always connect first** — call `herdr_connect` before any other herdr tool
- **Use the 3-step pattern** — send → wait → read. Don't read immediately after sending; wait for the output pattern first
- **Set reasonable timeouts** — long-running commands may need longer waits
- **Use ctrl+c for interrupts** — use `herdr_send_keys` with `["ctrl+c"]` to stop processes
- **Export layout before experiments** — save your layout with `herdr_layout_export` before making changes
- **Check pane_id** — use `herdr_pane_current` or `herdr_pane_list` to find the right pane

## Tool Reference

| Tool | Purpose |
|------|---------|
| `herdr_connect` | Connect to herdr socket |
| `herdr_disconnect` | Disconnect from herdr socket |
| `herdr_pane_current` | Get current focused pane info |
| `herdr_pane_list` | List all panes |
| `herdr_pane_send_text` | Send text/command to a pane |
| `herdr_pane_read` | Read output from a pane |
| `herdr_pane_wait` | Wait for a pattern in pane output |
| `herdr_pane_split` | Split a pane horizontally or vertically |
| `herdr_workspace_list` | List all workspaces |
| `herdr_workspace_focus` | Focus a specific workspace |
| `herdr_send_keys` | Send key combos to a pane |
| `herdr_layout_export` | Export current layout as JSON |