# Herdr Socket API Reference

> Dokumentasi lengkap Herdr Socket API untuk referensi pengembangan pi-herdr.
> Sumber: https://herdr.dev/docs/preview/socket-api/

## Protocol

- **Transport**: Unix Domain Socket (`node:net`)
- **Format**: Newline-delimited JSON (NDJSON)
- **Socket Path**: `~/.config/herdr/herdr.sock`
- **Auth**: Filesystem access ke socket (none required beyond file permissions)

### Request Format
```json
{"id": "unique_id", "method": "method.name", "params": {}}
```

### Success Response
```json
{"id": "unique_id", "result": {}}
```

### Error Response
```json
{"id": "unique_id", "error": {"code": "error_code", "message": "human message"}}
```

## Socket Path Discovery

Priority order:
1. `HERDR_SOCKET_PATH` env var
2. Named session: `~/.config/herdr/sessions/<name>/herdr.sock`
3. `HERDR_SESSION` env var
4. Default: `~/.config/herdr/herdr.sock`

## Pane ID Format

`w{workspace}:t{tab}:p{pane}` (e.g., `w1:p1`, `w1:t1`, `w2:p3`)

## Environment Injection

Managed processes receive:
- `HERDR_SOCKET_PATH` — path to control socket
- `HERDR_ENV=1` — indicates Herdr-managed environment
- `HERDR_WORKSPACE_ID`, `HERDR_TAB_ID`, `HERDR_PANE_ID` — context identifiers

## Connection Lifetime

- **Normal request-response**: Connection is closed after response
- **Event subscriptions**: Connection stays open for push events
  > "Event subscriptions keep the connection open after the initial response."

## Complete Method List

### Server

| Method | Params | Returns |
|--------|--------|---------|
| `ping` | `{}` | `{"type":"pong"}` |
| `server.stop` | `{}` | - |
| `server.reload_config` | `{}` | - |
| `server.agent_manifests` | `{}` | - |
| `server.reload_agent_manifests` | `{}` | - |

### Notification
| Method | Params |
|--------|--------|
| `notification.show` | `{ title, body?, level? }` |

### Client
| Method | Params |
|--------|--------|
| `client.window_title.set` | `{ title }` |
| `client.window_title.clear` | `{}` |

### Workspace
| Method | Params | Returns |
|--------|--------|---------|
| `workspace.create` | `{ label? }` | `WorkspaceInfo` |
| `workspace.list` | `{}` | `WorkspaceInfo[]` |
| `workspace.get` | `{ id }` | `WorkspaceInfo` |
| `workspace.focus` | `{ id }` | - |
| `workspace.rename` | `{ id, label }` | `WorkspaceInfo` |
| `workspace.close` | `{ id }` | - |

### Worktree
| Method | Params |
|--------|--------|
| `worktree.list` | `{}` |
| `worktree.create` | `{ path, branch? }` |
| `worktree.open` | `{ path }` |
| `worktree.remove` | `{ path }` |

### Tab
| Method | Params | Returns |
|--------|--------|---------|
| `tab.create` | `{ id?, label? }` | `TabInfo` |
| `tab.list` | `{ workspace_id? }` | `TabInfo[]` |
| `tab.get` | `{ id }` | `TabInfo` |
| `tab.focus` | `{ id }` | - |
| `tab.rename` | `{ id, label }` | `TabInfo` |
| `tab.close` | `{ id }` | - |

### Pane

| Method | Params | Returns |
|--------|--------|---------|
| `pane.split` | `{ id?, direction: "right"\|"down", size? }` | `PaneInfo` |
| `pane.swap` | `{ direction }` or `{ source_pane_id, target_pane_id }` | - |
| `pane.move` | `{ pane_id, tab_id, ... }` | - |
| `pane.zoom` | `{ id?, toggle?/on?/off? }` | - |
| `pane.layout` | `{ id? }` | Layout info |
| `pane.process_info` | `{ id? }` | Process info |
| `pane.neighbor` | `{ direction, id? }` | Pane info |
| `pane.edges` | `{ id? }` | Edge info |
| `pane.focus_direction` | `{ direction, id? }` | - |
| `pane.resize` | `{ direction, amount?, id? }` | - |
| `pane.list` | `{}` | `PaneInfo[]` |
| `pane.current` | `{}` | `PaneInfo` |
| `pane.get` | `{ id }` | `PaneInfo` |
| `pane.rename` | `{ id, label? \| null }` | `PaneInfo` |
| `pane.send_text` | `{ id, text, execute? }` | - |
| `pane.send_keys` | `{ id, keys: string[] }` | - |
| `pane.send_input` | `{ id, input }` | - |
| `pane.read` | `{ id, lines?, timeout? }` | Output text |
| `pane.wait_for_output` | `{ id, pattern, timeout? }` | - |
| `pane.close` | `{ id }` | - |
| `pane.report_agent` | `{ id, source, agent, state, ... }` | - |
| `pane.report_agent_session` | `{ id, source, agent, ... }` | - |
| `pane.report_metadata` | `{ id, source, ... }` | - |
| `pane.clear_agent_authority` | `{ id, source }` | - |
| `pane.release_agent` | `{ id, source, agent }` | - |

### Layout

| Method | Params | Returns |
|--------|--------|---------|
| `layout.export` | `{}` | Layout JSON |
| `layout.apply` | `{ layout }` | - |

### Agent

| Method | Params |
|--------|--------|
| `agent.list` | `{}` |
| `agent.get` | `{ id }` |
| `agent.read` | `{ id }` |
| `agent.explain` | `{ id }` |
| `agent.send` | `{ id, text }` |
| `agent.rename` | `{ id, label }` |
| `agent.focus` | `{ id }` |
| `agent.start` | `{ id?, cwd?, command? }` |

### Integrations

| Method | Params |
|--------|--------|
| `integration.install` | `{ type, config? }` |
| `integration.uninstall` | `{ id }` |

### Plugins

| Method | Params |
|--------|--------|
| `plugin.link` | `{ path }` |
| `plugin.list` | `{}` |
| `plugin.unlink` | `{ id }` |
| `plugin.enable` | `{ id }` |
| `plugin.disable` | `{ id }` |
| `plugin.action.list` | `{ plugin_id }` |
| `plugin.action.invoke` | `{ plugin_id, action_id, params? }` |
| `plugin.log.list` | `{ plugin_id }` |
| `plugin.pane.open` | `{ plugin_id, pane_id? }` |
| `plugin.pane.focus` | `{ plugin_id, pane_id? }` |
| `plugin.pane.close` | `{ plugin_id, pane_id? }` |

### Events

| Method | Params |
|--------|--------|
| `events.subscribe` | `{ subscriptions: [{ type, pane_id?, ... }] }` |
| `events.wait` | `{ timeout? }` |

### Event Types

| Event | Description |
|-------|-------------|
| `workspace.created` | New workspace created |
| `workspace.closed` | Workspace closed |
| `workspace.focused` | Workspace gained focus |
| `pane.created` | New pane created |
| `pane.closed` | Pane closed |
| `pane.focused` | Pane gained focus |
| `pane.moved` | Pane moved to different tab/workspace |
| `pane.exited` | Pane process exited |
| `pane.agent_status_changed` | Agent state changed |
| `worktree.created` | Git worktree created |
| `worktree.opened` | Worktree opened |
| `worktree.removed` | Worktree removed |

### Key Combo Strings

Accepted by `pane.send_keys`:
- Plain printable keys
- Special: `enter`, `esc`, `tab`, `backspace`, `delete`, `insert`
- Modifiers: `ctrl+h`, `control+j`, `alt+x`, `shift+tab`
- Function keys: `f1` through `f12`
- Named punctuation: `minus`, `plus`

### pane.rename Example

```json
// Set label
{"id":"req1","method":"pane.rename","params":{"id":"w1:p1","label":"my-label"}}

// Clear label
{"id":"req2","method":"pane.rename","params":{"id":"w1:p1","label":null}}
```

### Source (dari Rust code)

From `src/api/schema/panes.rs`:
```rust
pub struct PaneRenameParams {
    pub pane_id: String,
    pub label: Option<String>,
}
```