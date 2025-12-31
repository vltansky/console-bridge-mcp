<div align="center">

<img src="packages/extension/icon.png" alt="console-bridge icon" width="128" height="128">

# console-bridge

**Give your AI assistant access to browser console logs**

Capture logs from all tabs, search errors, and debug in real-time.

[Quick Start](#quick-start) · [Features](#features) · [Tools](#mcp-tools) · [Config](#configuration)

</div>

---

## Why console-bridge?

Unlike browser automation tools that require you to connect each tab, **console-bridge works passively**. Once installed, it captures console output from all your browser tabs in the background — your AI agent can query logs anytime without you doing anything.

| | console-bridge | Browser automation tools |
|--|---------------|--------------------------|
| **Capture mode** | Passive, always on | On-demand, explicit connect |
| **Tab coverage** | All tabs simultaneously | Single tab at a time |
| **Log storage** | 10K logs with TTL | None |
| **Search** | Regex, keywords, time range | Not supported |
| **Use case** | Debugging | UI automation |

**Best for:** "My app is throwing errors, help me debug" workflows.

---

## Quick Start

console-bridge requires two components: a **browser extension** (captures logs) and an **MCP server** (stores/queries logs).

### 1. Install MCP Server

**Standard config** (works with most MCP clients):

```json
{
  "mcpServers": {
    "console-bridge": {
      "command": "npx",
      "args": ["-y", "console-bridge-mcp@latest"]
    }
  }
}
```

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor" height="32">](https://cursor.com/en/install-mcp?name=console-bridge&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImNvbnNvbGUtYnJpZGdlLW1jcEBsYXRlc3QiXX0=)

<details>
<summary>Claude Code</summary>

```bash
claude mcp add console-bridge -- npx -y console-bridge-mcp@latest
```

Or add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "console-bridge": {
      "command": "npx",
      "args": ["-y", "console-bridge-mcp@latest"]
    }
  }
}
```

</details>

<details>
<summary>VS Code</summary>

Add to your VS Code settings or use the CLI:

```bash
code --add-mcp '{"name":"console-bridge","command":"npx","args":["-y","console-bridge-mcp@latest"]}'
```

</details>

<details>
<summary>Windsurf</summary>

Follow Windsurf MCP [documentation](https://docs.windsurf.com/windsurf/cascade/mcp). Use the standard config above.

</details>

<details>
<summary>Other clients</summary>

Add the standard config to your MCP configuration file. See [MCP documentation](https://modelcontextprotocol.io/quickstart/user) for client-specific instructions.

</details>

### 2. Install Browser Extension

1. Download `console-bridge-ext-v*.zip` from the [latest release](https://github.com/vltansky/console-bridge-mcp/releases/latest)
2. Unzip to a permanent location (e.g., `~/.console-bridge-extension`)
3. Open Chrome → `chrome://extensions`
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked" → select the unzipped folder
6. Click the extension icon → verify it shows "Connected"

### 3. Verify Installation

Restart your MCP client, then try:

```
Show me recent console errors
```

If you see log data, you're all set!

---

## Features

### Log Capture & Analysis

Logs stream continuously from all browser tabs to the MCP server. Filter by level, tab, URL pattern, or time range.

```
Show error logs from the last 5 minutes
Show logs from localhost:3000
Tail logs from the current tab
```

### Powerful Search

Regex and keyword search with context lines, AND/OR logic, and exclusions.

```
Search for "failed" OR "error" excluding "expected"
Search for /api\/users\/\d+/ with 3 lines of context
```

### Smart Tab Suggestions

AI-assisted tab ranking based on your project context — ports, domains, URL patterns.

```
Suggest which tab is my Next.js app
```

### Session Scoping

Focus on logs from the current navigation only, ignoring stale logs from before the last page refresh.

```
Show errors from current session only
```

### JS Execution & DOM Queries

Run JavaScript in page context or query DOM elements directly.

```
Execute: window.featureFlags.enableDebug = true
Query DOM for '.error-message' elements
```

### One-Click Cursor Integration

Click **"Open in Cursor"** in the extension popup to instantly open Cursor with a context-aware prompt to analyze the current tab's logs.

### Project Skills

Create `.console-bridge/*.md` files to teach your AI project-specific debugging workflows.

```
List available debugging skills for this project
Load the "auth-flow" debugging skill
```

---

## MCP Tools

| Tool | Purpose |
|------|---------|
| `console_tabs` | List all tabs or get smart suggestions based on project context |
| `console_logs` | List, get single log, or tail with filtering (level, tab, URL, time) |
| `console_search` | Regex or keyword search with context lines and exclusions |
| `console_snapshot` | Quick summary of recent errors, warnings, and patterns |
| `console_browser_execute` | Run JavaScript in page context |
| `console_browser_query` | Query DOM elements by CSS selector |
| `console_skills_list` | List project-specific debugging playbooks |
| `console_skills_load` | Load a specific debugging skill |

---

## Configuration

Environment variables:

```bash
CONSOLE_MCP_PORT=9847              # WebSocket port
CONSOLE_MCP_DISCOVERY_PORT=9846    # HTTP discovery port
CONSOLE_MCP_MAX_LOGS=10000         # Max logs in memory
CONSOLE_MCP_LOG_TTL_MINUTES=60     # Auto-cleanup (0 = disable)
```

---

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐      stdio       ┌─────────────────┐
│                 │    (port 9847)     │                 │                  │                 │
│  Browser Ext.   │ ─────────────────▶ │   MCP Server    │ ◀──────────────▶ │  AI Assistant   │
│  (all tabs)     │    log batches     │  (stores/query) │    MCP protocol  │ (Cursor/Claude) │
│                 │                    │                 │                  │                 │
└─────────────────┘                    └─────────────────┘                  └─────────────────┘
        │                                      │
        │ captures console.*                   │ in-memory storage
        │ intercepts errors                    │ filtering engine
        │ sanitizes credentials                │ search engine
        │                                      │
```

**Data flow:**
1. Extension content script intercepts `console.log/warn/error/debug`
2. Logs are batched (50 logs/100ms) and sent via WebSocket
3. Server stores logs in-memory with configurable TTL
4. MCP tools query and analyze logs on demand

---

## Development

```bash
npm install && npm run build
npm run dev:server    # Hot reload server
npm run dev:extension # Hot reload extension
npm test              # Run tests
```

### Project Structure

```
packages/
├── server/          # MCP server + WebSocket receiver
├── extension/       # Chrome extension (content script + popup)
└── shared/          # Shared types and Zod schemas
```

---

## License

MIT
