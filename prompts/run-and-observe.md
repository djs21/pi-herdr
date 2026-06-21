---
description: Send a command to a herdr pane, wait for output, and read the result.
---
Use the crew_chain tool with the chain parameter to execute this workflow:

1. First, use the "worker" agent to call `herdr_pane_send_text` with params { pane_id: $@ , text: "$@" , execute: true }
2. Then, use the "worker" agent to call `herdr_pane_wait` with params { pane_id: $@ , pattern: "$@" , timeout: 30000 }
3. Finally, use the "worker" agent to call `herdr_pane_read` with params { pane_id: $@ }

Execute this as a chain, passing the pane_id between steps via {previous}.