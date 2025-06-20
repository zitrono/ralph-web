#!/bin/bash
curl -s -X POST -H "Content-Type: application/json" -d @/Users/zitrono/dev/cloze2/logs/claude-desktop-backtick-params.json http://localhost:3000/execute > /Users/zitrono/dev/cloze2/logs/backtick-response-2025-05-15T14-33-34.844Z.json
echo "Response saved to /Users/zitrono/dev/cloze2/logs/backtick-response-2025-05-15T14-33-34.844Z.json"
