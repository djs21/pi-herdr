# PRD: pi-herdr — Herdr Socket API Extension for Pi Coding Agent

## Problem Statement

Pengguna mengembangkan pi coding agent di dalam herdr terminal workspace manager, namun pi agent tidak memiliki kesadaran atau kendali atas lingkungan herdr-nya. Pi agent buta terhadap pane lain, workspace, tab, dan tidak bisa mengirim command atau membaca output dari pane yang berbeda. Setiap kali pengguna perlu interaksi lintas-pane (kirim command, baca output, split pane, ganti workspace), mereka harus melakukannya manual di luar pi agent — memutus flow coding.

Pi agent membutuhkan jembatan ke herdr Socket API agar bisa bertindak sebagai first-class citizen di lingkungan herdr.

## Solution

Bangun extension pi bernama **pi-herdr** yang mengekspos herdr Socket API sebagai custom tools pi. Extension ini menggunakan **vertical slice architecture** (seperti crew-of-pi) sehingga setiap domain fitur terisolasi, mudah ditambah/dihapus, dan self-contained.

Pi agent bisa:
- Connect ke herdr Unix socket
- Melihat dan navigasi workspace/tab/pane
- Mengirim command dan membaca output dari pane mana pun
- Mengirim key combos (ctrl+c, ctrl+d, dll)
- Split pane dan mengatur layout
- Berlangganan event (pane changed, workspace focused)
- Wait for output pattern di suatu pane

Semua interaksi terjadi via Unix Domain Socket (`~/.config/herdr/herdr.sock`) — JSON-over-socket, newline-delimited.

## User Stories

1. As a pi developer working inside herdr, I want pi agent to auto-connect to herdr socket on session start, so that I don't need to manually connect every time.

2. As a pi developer, I want to ask pi agent "pane mana yang aktif" and get current pane info (id, title, cwd, workspace), so that I know my context in the terminal.

3. As a pi developer, I want to tell pi agent "kirim command \`npm test\` ke pane 2" and have it execute there, so that I can run tasks in parallel without switching panes.

4. As a pi developer, I want pi agent to read output from a specific pane after sending a command, so that I can see results without manually switching.

5. As a pi developer, I want pi agent to wait for a specific pattern in pane output (e.g., "PASS" or "Error"), so that I can automate long-running command monitoring.

6. As a pi developer, I want pi agent to list all panes across all workspaces, so that I can understand the full terminal layout.

7. As a pi developer, I want pi agent to focus a specific workspace by name or id, so that I can navigate between projects.

8. As a pi developer, I want pi agent to send key combos like ctrl+c to a pane, so that I can interrupt running processes remotely.

9. As a pi developer, I want pi agent to split a pane horizontally or vertically, so that I can create new terminal layouts programmatically.

10. As a pi developer, I want pi agent to export the current layout as JSON, so that I can save and restore workspace configurations.

11. As a pi developer, I want pi agent to list all workspaces with their tabs and panes, so that I can get a bird's-eye view of my terminal environment.

12. As a pi developer, I want clear error messages when herdr is not running or socket is not found, so that I know what's wrong without guessing.

13. As a pi developer, I want pi agent to know it's running inside herdr and automatically discover the correct socket path, so that setup is zero-config.

14. As a pi developer, I want pi agent to report agent status back to herdr via \`pane.report_agent\`, so that herdr knows when pi is actively working in a pane.

15. As a pi developer, I want to use \`/herdr:run-and-observe\` to send a command and get output back in one workflow, so that common tasks are one command away.

## Implementation Decisions

### Architecture: Vertical Slices

Extension menggunakan vertical slice architecture (mengikuti pola crew-of-pi). Setiap domain fitur adalah slice independen di \`slices/\`:

| Slice | Tanggung Jawab |
|-------|---------------|
| **socket** | Koneksi Unix socket lifecycle, request/response matching, auto-discovery socket path |
| **pane** | Operasi pane: current, list, send_text, read, split, wait_for_output |
| **workspace** | Operasi workspace: list, focus |
| **keys** | Key combos: send_keys, send_input |
| **layout** | Layout: export, apply |
| **events** | Event subscription: subscribe, forward ke agent via steering message |

### Socket Protocol (Herdr API Contract)

- **Transport**: Unix Domain Socket (\`node:net\`)
- **Format**: Newline-delimited JSON (NDJSON)
- **Request**: \`{"id":"<unique>","method":"<method>","params":{...}}\`
- **Success**: \`{"id":"<id>","result":{...}}\`
- **Error**: \`{"id":"<id>","error":{"code":"<code>","message":"..."}}\`

### Socket Path Discovery (priority order)

1. \`HERDR_SOCKET_PATH\` env var
2. \`--session <name>\` → \`~/.config/herdr/sessions/<name>/herdr.sock\`
3. \`HERDR_SESSION\` env var → \`~/.config/herdr/sessions/<name>/herdr.sock\`
4. Default: \`~/.config/herdr/herdr.sock\`

### Tool Design

Setiap tool mengikuti pola:
- Nama: \`herdr_<domain>_<action>\` (e.g., \`herdr_pane_send_text\`)
- Parameter: TypeBox schema strict
- Execute: call \`SocketManager.sendRequest(method, params)\` → format result
- Error: propagate herdr error messages to user
- Auto-connect: jika socket belum connect, return error dengan instruksi connect dulu

### Singleton SocketManager

Satu \`SocketManager\` instance per session, di-share ke semua slice via accessor pattern (\`getSocketManager()\`). Lifecycle:
- \`session_start\`: auto-discover socket path, connect
- \`session_shutdown\`: disconnect, cleanup
- Tools: \`herdr_connect\` untuk connect manual, \`herdr_disconnect\` untuk disconnect

### Skill Layer

SKILL.md memberikan panduan ke pi agent:
1. Selalu connect dulu sebelum make tools
2. Cek current pane setelah connect
3. Kirim command → tunggu output → baca hasil (pola 3-step)
4. Pakai \`herdr_pane_wait\` untuk long-running commands
5. Gunakan key combos untuk interupsi (ctrl+c)
6. Export layout sebelum eksperimen besar

### Prompt Templates

Workflow chain templates untuk common tasks:
- \`run-and-observe\`: send_text → wait_for_output → read
- \`debug-terminal\`: split pane → run debug command → read output
- \`setup-workspace\`: create/focus workspace → split panes → send setup commands → export layout

## Testing Decisions

**Testing philosophy**: Test external behavior (socket I/O roundtrip, tool registration, error propagation), not internal implementation details of SocketManager.

### Test Seams (highest to lowest):

| Seam | Level | Description |
|------|-------|-------------|
| **Mock Unix Socket Server** | Integration | \`node:net\` server yang mimic herdr protocol — listen di random path, parse NDJSON, respond based on method. Tertinggi yang praktis tanpa herdr real. |
| **Socket Manager Unit** | Unit | Test SocketManager dengan injected mock \`net.Socket\`: connect/disconnect, request/response matching by id, timeout, error. |
| **Tool Registration** | Unit | Test all tools register with correct name, description, parameter schema. Verify via pi's tool registry. |

### Test Scenarios (per seam)

**Mock Socket Server:**
- Kirim \`pane.current\` → terima response pane_info
- Kirim \`pane.send_text\` → verifikasi command sampai di server
- Kirim \`workspace.list\` → terima array workspace
- Socket not found → error messaging
- Invalid pane_id → error propagation

**Socket Manager Unit:**
- Connect → state jadi connected
- Disconnect → state jadi disconnected
- Send request → response matched by id
- Timeout → reject dengan error
- Multiple concurrent requests → semua response matched correctly

**Tool Registration:**
- Semua tools registered dengan nama \`herdr_*\`
- Schema parameters sesuai TypeBox strict
- Deskripsi tools jelas dan informatif
- Tools muncul di \`pi.getAllTools()\`

## Out of Scope

- **GUI/UI components**: Tidak ada custom TUI untuk herdr
- **Full agent integration**: \`pane.report_agent\` dan \`pane.report_agent_session\` opsional (v2)
- **Plugin management**: \`plugin.*\` methods tidak di-expose di v1
- **Integration management**: \`integration.*\` methods tidak di-expose di v1
- **Windows Named Pipes**: v1 fokus Unix socket (Linux/macOS), Windows support via named pipes bisa ditambah later
- **Real-time event streaming**: Event subscription forwarding via steering message sederhana — bukan full event bus
- **Layout apply**: \`layout.apply\` bisa ditambah di v2 setelah export stabil
- **Worktree management**: \`worktree.*\` methods tidak di-expose di v1

## Further Notes

- Extension ini bergantung pada herdr yang berjalan — tanpa herdr, tools return error "Herdr not running"
- Socket path discovery harus handle edge cases: symlink, permission denied, socket file stale (herdr crashed)
- Pane ID (\`w{ws}:t{tab}:p{pane}\`) diperlakukan sebagai opaque string — tidak parsing struktur internal
- Setiap tool harus handle kasus di mana SocketManager belum diinisialisasi (user lupa connect)
- Concurrent request handling penting karena socket bisa kirim response out-of-order — tracking by request ID
- Extension bisa direload via \`/reload\` tanpa restart pi