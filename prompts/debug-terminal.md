---
description: Set up a debug terminal by splitting a pane and running a debug command.
---
Use the crew_chain tool with the chain parameter to execute this workflow:

1. First, use the "worker" agent to call `herdr_pane_split` with params { pane_id: $@ , direction: "horizontal" }
2. Then, use the "worker" agent to call `herdr_pane_send_text` with params { pane_id: $@ , text: "$@" , execute: true }
3. Finally, use the "worker" agent to call `herdr_pane_read` with params { pane_id: $@ }

Execute this as a chain, passing the new pane_id between steps via {previous}.