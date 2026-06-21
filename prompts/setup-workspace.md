---
description: Set up a workspace by focusing it, splitting panes, and sending setup commands.
---
Use the crew_chain tool with the chain parameter to execute this workflow:

1. First, use the "worker" agent to call `herdr_workspace_focus` with params { workspace_id: $@ }
2. Then, use the "worker" agent to call `herdr_pane_split` with params { direction: "horizontal" }
3. Finally, use the "worker" agent to call `herdr_pane_send_text` with params { pane_id: $@ , text: "$@" , execute: true }

Execute this as a chain, passing output between steps via {previous}.