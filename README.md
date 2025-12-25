<div align="center">

# console-logs-mcp

**Real-time Browser Console Logs for AI Assistants**

A Model Context Protocol (MCP) server that captures browser console logs in real-time and provides AI assistants with powerful tools to query, search, and analyze debugging information.

[![NPM Version](https://img.shields.io/npm/v/console-logs-mcp)](https://www.npmjs.com/package/console-logs-mcp)
[![License](https://img.shields.io/npm/l/console-logs-mcp)](./LICENSE)
[![MCP](https://img.shields.io/badge/Model_Context_Protocol-MCP_Server-blue)](https://modelcontextprotocol.io)

</div>

---

## Table of Contents

- [See It In Action](#see-it-in-action)
- [Why console-logs-mcp?](#why-console-logs-mcp)
- [Features](#features)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Client-Specific Setup](#client-specific-setup)
- [Usage](#usage)
- [MCP Tools Reference](#mcp-tools-reference)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Development](#development)
- [Community](#community)
- [Contributing](#contributing)
- [License](#license)

---

## See It In Action

### Debugging React Application Errors in Real-Time

Watch how console-logs-mcp transforms the debugging workflow by giving AI assistants direct access to browser console logs.

**Scenario**: You're building a React app and encountering authentication errors. Instead of manually copying logs, just ask your AI assistant:

**Prompt:**

> Show me all error logs from the last 5 minutes on localhost:3000

**What happens:**
- console-logs-mcp instantly fetches matching logs with full stack traces
- AI analyzes the error patterns and identifies the root cause
- You get actionable fixes without switching between browser and editor

---

### Smart Tab Selection for Multi-Project Development

When working on multiple projects simultaneously, console-logs-mcp intelligently suggests which browser tab to focus on.

**Prompt:**

> Which tab should I focus on for debugging my checkout flow?

**What happens:**
- console-logs-mcp analyzes your project context (working directory, ports, URL patterns)
- Ranks all open tabs by relevance
- Suggests the most likely tab with reasoning
- Shows recent error counts per tab

**Result**: No more hunting through dozens of browser tabs to find the right one.

---

### Pattern Analysis Across Sessions

**Prompt:**

> Search for "authentication failed" errors in the last hour and show me the pattern

**What happens:**
- console-logs-mcp searches across all captured logs using regex/keyword matching
- Groups errors by frequency, URL, and time distribution
- AI identifies patterns (e.g., "All auth errors happen after token refresh")
- Suggests fixes based on the error context

---

## Why console-logs-mcp?

### ❌ Without console-logs-mcp

When debugging with AI assistants, you have to:

- Manually copy-paste console logs from browser DevTools
- Switch between browser and editor constantly
- Lose context when console clears or page reloads
- Struggle to describe complex error patterns

### ✅ With console-logs-mcp

console-logs-mcp automatically captures all browser console logs and lets AI assistants:

- **Query logs in real-time** - Ask "Show me all authentication errors from the last 5 minutes"
- **Search with natural language** - "Find network timeout errors on the checkout page"
- **Analyze patterns** - Get statistics, filter by severity, group by tab/URL
- **Debug faster** - AI sees the exact errors without manual copy-paste

**Example:**

```txt
Show me all error logs from the last 10 minutes on localhost:3000
```

console-logs-mcp fetches matching logs instantly, with full stack traces, timestamps, and tab context.

---

## Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| 🔍 **Real-time Log Capture** | Browser extension captures console logs from all tabs | Never miss a log, even on page reload |
| 🤖 **AI Integration** | Query logs using natural language through 16 MCP tools | Ask questions instead of writing filters |
| 🎯 **Smart Tab Selection** | Automatically suggest relevant tabs based on project context | Find the right tab instantly in multi-project setups |
| 🔎 **Advanced Search** | Regex and keyword search with filtering by level, URL, time | Powerful pattern matching and boolean logic |
| 📊 **Session Management** | Save and restore named log sessions for debugging | Compare before/after, reproduce issues with memorable names |
| 🔒 **Data Sanitization** | Automatically mask sensitive information (tokens, keys) | Debug safely without exposing secrets |
| 📤 **Export** | Export logs in JSON, CSV, or plain text formats | Share logs with team, analyze offline |
| ⚡ **Lightweight** | Batched WebSocket protocol, minimal performance impact | <1% CPU overhead, 95% network reduction |
| 📁 **Project Context** | MCP resources expose working directory and environment info | Context-aware suggestions and filtering |
| 🎮 **Browser Automation** | Execute JavaScript, query DOM, get page info directly from AI | Reproduce issues, test fixes, inspect state without DevTools |

---

## Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **Chrome or Edge** browser
- **MCP Client** (Cursor, Claude Code, VS Code, Windsurf, etc.)

### Quick Start

console-logs-mcp requires two components: the MCP server and the browser extension.

#### Step 1: Install the MCP Server

```bash
npx console-logs-mcp@latest
```

#### Step 2: Install Browser Extension

```bash
# Clone and build
git clone https://github.com/vltansky/console-logs-mcp.git
cd console-logs-mcp
npm install
npm run build

# Load extension in Chrome/Edge:
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select packages/extension/dist
```

> **Note**: The extension is currently in development and not yet published to the Chrome Web Store. You'll need to load it as an unpacked extension.

#### Step 3: Configure Your MCP Client

See [Client-Specific Setup](#client-specific-setup) below for your preferred tool.

#### Step 4: Verify Installation

After installation, verify console-logs-mcp is working:

1. **Restart your MCP client** completely
2. **Check connection status**:
   - **Cursor**: Look for green dot in Settings → Tools & Integrations → MCP Tools
   - **Claude Desktop**: Check for "console-logs-mcp" in available tools
   - **VS Code**: Verify in GitHub Copilot settings
3. **Test with a simple query**:
   ```
   Show me all console logs from the last 5 minutes
   ```

If you see console-logs-mcp tools being used, you're all set! 🎉

---

### Client-Specific Setup

<details>
<summary><b>Cursor</b></summary>

#### One-Click Install

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor">](https://cursor.com/en/install-mcp?name=console-logs-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImNvbnNvbGUtbG9ncy1tY3BAbGF0ZXN0Il19)

#### Manual Install

Go to `Cursor Settings` → `MCP` → `Add new MCP Server`. Name to your liking, use `command` type with the command `npx -y console-logs-mcp@latest`. You can also verify config or add command arguments via clicking `Edit`.

#### Project-Specific Configuration

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "console-logs-mcp": {
      "command": "npx",
      "args": ["-y", "console-logs-mcp@latest"]
    }
  }
}
```

</details>

<details>
<summary><b>Claude Code</b></summary>

Use the Claude Code CLI:

```bash
claude mcp add console-logs-mcp npx -y console-logs-mcp@latest
```

Or manually edit `~/.claude/config.json`:

```json
{
  "mcpServers": {
    "console-logs-mcp": {
      "command": "npx",
      "args": ["-y", "console-logs-mcp@latest"]
    }
  }
}
```

</details>

<details>
<summary><b>VS Code / VS Code Insiders</b></summary>

#### Click the button to install:

[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22console-logs-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22console-logs-mcp%40latest%22%5D%7D) [<img alt="Install in VS Code Insiders" src="https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&label=Install%20Server&color=24bfa5">](https://insiders.vscode.dev/redirect?url=vscode-insiders%3Amcp%2Finstall%3F%7B%22name%22%3A%22console-logs-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22console-logs-mcp%40latest%22%5D%7D)

#### Or install manually:

Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server). You can also install using the VS Code CLI:

```bash
# For VS Code
code --add-mcp '{"name":"console-logs-mcp","command":"npx","args":["-y","console-logs-mcp@latest"]}'
```

Or add to `settings.json`:

```json
{
  "mcp.servers": {
    "console-logs-mcp": {
      "command": "npx",
      "args": ["-y", "console-logs-mcp@latest"]
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "console-logs-mcp": {
      "command": "npx",
      "args": ["-y", "console-logs-mcp@latest"]
    }
  }
}
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Follow the [MCP install guide](https://modelcontextprotocol.io/quickstart/user), then add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "console-logs-mcp": {
      "command": "npx",
      "args": ["-y", "console-logs-mcp@latest"]
    }
  }
}
```

</details>

---

## Usage

Once installed, the browser extension automatically captures console logs. Your AI assistant can now query them using natural language.

### Example Prompts

**List recent errors:**
```
Show me all error logs from the last 5 minutes
```

**Search for patterns:**
```
Search console logs for "authentication failed" or "401"
```

**Filter by URL:**
```
List warning logs from localhost:3000/checkout
```

**Smart tab selection:**
```
Which tab should I focus on for this project?
```

**Get statistics:**
```
Show console log statistics grouped by level
```

**Export logs:**
```
Export all error logs from the last hour as JSON
```

**Session management:**
```
Save current console logs as session "bug-investigation-2025"
```

**Browser automation:**
```
Execute JavaScript: document.querySelector('.error-message').textContent
```

```
Query DOM for '.submit-btn' and get disabled, className properties
```

---

## MCP Tools Reference

console-logs-mcp provides 16 specialized tools for comprehensive log management and browser automation. These tools work together to provide a complete debugging workflow.

---

### 🎯 Tab Selection

#### `console_suggest_tab`

**Intelligently suggest relevant tabs based on project context**

The smartest way to find which browser tab you should focus on when debugging.

**Key Features**:
- **Context-Aware**: Analyzes working directory, expected ports, and URL patterns
- **Ranked Results**: Returns top 5 suggestions with reasoning
- **Activity Tracking**: Shows recent error counts per tab
- **Pattern Matching**: Matches against project-specific domains and paths

**Common Use Cases**:
```
• Multi-project debugging: "Which tab is for my checkout service?"
• Port-based selection: "Find the tab running on port 3000"
• Domain filtering: "Show me tabs from localhost"
```

**Best Practices**:
- Provide working directory for better context
- Specify expected ports (e.g., [3000, 5173])
- Use URL patterns for specific routes (e.g., "/api/*")

---

#### `console_get_tabs`

**Get active browser tabs with log counts**

Quick overview of all tabs currently being monitored.

**Returns**:
- Tab ID and title
- Current URL
- Log count by severity level
- Last activity timestamp

**Common Use Cases**:
```
• Overview: "Show me all active tabs"
• Log counts: "Which tabs have error logs?"
• Activity check: "List tabs with recent console activity"
```

---

### 📋 Query & Filter

#### `console_list_logs`

**List logs with advanced filtering**

The primary tool for querying logs with powerful filtering options.

**Key Features**:
- **Time Range Filtering**: Absolute timestamps or relative (e.g., "5m", "1h")
- **Level Filtering**: Filter by log, info, warn, error, debug
- **URL Pattern Matching**: Regex support for URL filtering
- **Tab-Specific**: Focus on specific browser tabs
- **Pagination**: Handle large result sets efficiently

**Common Use Cases**:
```
• Recent errors: "Show error logs from the last 10 minutes"
• URL-specific: "List warnings from /api/checkout"
• Tab filtering: "Get all logs from tab ID 123"
• Time range: "Show logs between 2:00 PM and 3:00 PM"
```

**Best Practices**:
- Use relative time filters ("5m", "1h") for recent debugging
- Set `includeArgs: false` and `includeStack: false` initially to reduce token usage
- Apply level filters to focus on specific severity
- Use `limit` parameter to control result size

---

#### `console_get_log`

**Get a specific log entry by ID**

Retrieve full details of a single log entry, including all arguments and stack traces.

**Returns**:
- Complete log message
- Full argument array
- Stack trace (if available)
- Timestamp and metadata

**Common Use Cases**:
```
• Deep inspection: "Get full details of log ID abc123"
• Stack trace analysis: "Show me the complete stack for this error"
```

---

#### `console_tail_logs`

**Stream the most recent logs (live feed)**

Real-time log streaming for active debugging sessions.

**Key Features**:
- **Live Updates**: Follow new logs as they arrive
- **Initial Context**: Shows N most recent logs first
- **Filtering**: Apply same filters as list_logs
- **Auto-Follow**: Continues streaming until stopped

**Common Use Cases**:
```
• Active debugging: "Tail error logs in real-time"
• Monitor specific URL: "Follow logs from /api/users"
• Live testing: "Stream logs while I test this feature"
```

---

### 🔍 Search

#### `console_search_logs`

**Search using regex patterns**

Powerful pattern-based search across log messages, arguments, and stack traces.

**Key Features**:
- **Regex Support**: Full regular expression syntax
- **Multi-Field Search**: Search message, args, or stack traces
- **Context Lines**: Include surrounding logs for context
- **Case Sensitivity**: Optional case-sensitive matching

**Common Use Cases**:
```
• Pattern matching: "Find logs matching /auth.*failed/i"
• Error codes: "Search for HTTP 4xx or 5xx errors"
• Function calls: "Find all calls to validateUser()"
```

**Best Practices**:
- Start with simple patterns, refine as needed
- Use case-insensitive search by default
- Add context lines (2-3) to understand log flow
- Search only necessary fields to reduce token usage

---

#### `console_search_keywords`

**Search using keyword matching (AND/OR logic)**

Simple keyword-based search with boolean logic.

**Key Features**:
- **AND Logic**: All keywords must match
- **OR Logic**: Any keyword can match
- **Exclusions**: Exclude logs containing specific keywords
- **Fast**: Optimized for simple text matching

**Common Use Cases**:
```
• Multiple terms (AND): "Find logs with both 'authentication' AND 'failed'"
• Any term (OR): "Search for 'error' OR 'exception' OR 'failed'"
• Exclusions: "Find 'api' logs but exclude 'health-check'"
```

**Best Practices**:
- Use AND logic for precise matches
- Use OR logic for broad discovery
- Combine with exclusions to filter noise

---

### 📊 Analytics

#### `console_get_stats`

**Get statistics about captured logs**

Comprehensive analytics about your log data.

**Returns**:
- Total log count by level
- Logs per tab with URLs
- Time distribution (logs per hour/minute)
- Most common error patterns
- Active tabs summary

**Common Use Cases**:
```
• Overview: "Show me console log statistics"
• Error analysis: "How many errors occurred in the last hour?"
• Tab comparison: "Which tab has the most warnings?"
```

---

### 🗂️ Management

#### `console_clear_logs`

**Clear stored logs from memory**

Remove logs to free up memory or start fresh debugging session.

**Options**:
- Clear all logs
- Clear logs before specific timestamp
- Clear logs from specific tab only

**Common Use Cases**:
```
• Fresh start: "Clear all console logs"
• Old logs: "Clear logs older than 1 hour"
• Tab-specific: "Clear logs from tab 123"
```

---

#### `console_export_logs`

**Export logs in JSON, CSV, or text format**

Save logs for offline analysis, reporting, or archival.

**Formats**:
- **JSON**: Structured data with all fields
- **CSV**: Spreadsheet-compatible format
- **TXT**: Human-readable plain text

**Options**:
- Select specific fields to export
- Apply filters before export
- Pretty-print JSON for readability

**Common Use Cases**:
```
• Bug reports: "Export error logs as JSON for the bug report"
• Analysis: "Export last hour's logs as CSV for analysis"
• Documentation: "Save these logs as readable text"
```

---

### 💾 Sessions

#### `console_save_session`

**Save current logs as a named session**

Preserve log state for later review or comparison with human-readable names.

**Key Features**:
- Named sessions for easy identification (e.g., "bug-123", "auth-error-investigation")
- Optional descriptions for context
- Includes all log metadata and timestamps
- Apply filters to save subset of logs
- Persistent storage across restarts

**Common Use Cases**:
```
• Bug investigation: "Save current logs as 'checkout-bug-2025' with description 'Payment flow crash'"
• Before/after comparison: "Save session 'before-fix' before deploying fix"
• Reproduce issues: "Save logs from failed test run as 'test-failure-nov-9'"
```

**Parameters**:
- `name` (optional): Human-readable session name
- `description` (optional): What this session contains
- `filter` (optional): Filter logs to save

---

#### `console_load_session`

**Load a previously saved session by ID or name**

Restore logs from a saved session for review or comparison. Accepts either UUID or human-readable name.

**Key Features**:
- Load by name (e.g., "bug-123") or UUID
- Returns all logs from the session
- Preserves original timestamps and metadata

**Common Use Cases**:
```
• Review: "Load session 'checkout-bug-2025'"
• Compare: "Load yesterday's error session"
• Reproduce: "Restore logs from failed deployment"
```

---

#### `console_list_sessions`

**List all saved sessions**

View all available saved sessions with metadata.

**Returns**:
- Session names and IDs
- Creation timestamps
- Log counts per session
- Size information

**Common Use Cases**:
```
• Overview: "Show all saved log sessions"
• Find session: "List sessions from last week"
```

---

### 📦 Resources

#### `console://context`

**Project context resource**

MCP resource exposing project metadata for better context-aware suggestions.

**Provides**:
- Current working directory
- Project name (from package.json)
- Suggested ports (from common frameworks)
- Environment information

**Used by**:
- `console_suggest_tab` for intelligent tab selection
- AI assistants for project-aware debugging

---

### 🎮 Browser Automation

#### `console_execute_js`

**Execute JavaScript code in browser tab context**

Run arbitrary JavaScript in the browser to reproduce issues, test fixes, or query application state.

**Key Features**:
- Execute code in page context (has access to all page variables)
- Returns execution result
- Optional tab targeting
- Error handling with stack traces

**Common Use Cases**:
```
• Reproduce bugs: "Execute: document.querySelector('.submit-btn').click()"
• Query state: "Execute: JSON.stringify(window.appState)"
• Test fixes: "Execute: localStorage.setItem('debug', 'true')"
• Inspect globals: "Execute: Object.keys(window)"
```

**Security Note**: Code runs with full page access. Only execute trusted code.

---

#### `console_get_page_info`

**Get page information (title, URL, optionally HTML)**

Retrieve current page metadata to understand debugging context.

**Key Features**:
- Page title and URL
- Optional full HTML dump
- Works across all tabs
- Lightweight (excludes HTML by default)

**Common Use Cases**:
```
• Verify page: "What page am I on?"
• Check URL params: "Get current page URL"
• Inspect HTML: "Get page HTML for the checkout page"
```

---

#### `console_query_dom`

**Query DOM elements using CSS selectors**

Inspect page elements and extract properties without opening DevTools.

**Key Features**:
- Standard CSS selector syntax
- Extract multiple properties per element
- Returns all matching elements
- Handles dynamic content

**Common Use Cases**:
```
• Find errors: "Query DOM for '.error-message' and get textContent"
• Check forms: "Query 'input[type=email]' and get value"
• Inspect buttons: "Query '.submit-btn' and get disabled, className"
• Count elements: "How many '.product-card' elements are there?"
```

**Default Properties** (if not specified):
- `textContent`
- `className`
- `id`
- `tagName`

---

## Configuration

Environment variables for the server:

```bash
CONSOLE_MCP_PORT=9847              # WebSocket server port (default: 9847)
CONSOLE_MCP_MAX_LOGS=10000         # Maximum logs to store in memory (default: 10000)
CONSOLE_MCP_SANITIZE_LOGS=true     # Enable automatic data sanitization (default: true)
CONSOLE_MCP_BATCH_SIZE=50          # Batch size for log sending (default: 50)
CONSOLE_MCP_BATCH_INTERVAL_MS=100  # Batch interval in milliseconds (default: 100)
```

**Example:**

```bash
# Increase log storage and change port
CONSOLE_MCP_PORT=8080 CONSOLE_MCP_MAX_LOGS=50000 npx console-logs-mcp@latest
```

---

## Architecture

console-logs-mcp uses a three-component architecture for efficient real-time log capture and analysis:

```
┌─────────────────────┐          ┌──────────────────────┐          ┌─────────────────┐
│   Browser Tabs      │          │    MCP Server        │          │  AI Assistant   │
│                     │          │                      │          │                 │
│  Console Logs       │─────────▶│  WebSocket :9847     │◀─────────│  MCP Tools      │
│  (Extension)        │  Batched │  • Log Storage       │  stdio   │  (Cursor/etc)   │
│  • Intercept        │          │  • Filter Engine     │          │                 │
│  • Batch            │          │  • Search Engine     │          │                 │
│  • Send             │          │  • Tab Suggester     │          │                 │
└─────────────────────┘          └──────────────────────┘          └─────────────────┘
```

### Packages

| Package | Description | Key Components |
|---------|-------------|----------------|
| **`console-logs-mcp`** | MCP server exposing 13 tools + WebSocket server | MCP tools, WebSocket server, log storage, filter/search engines, tab suggester, session manager |
| **`console-logs-mcp-extension`** | Chrome/Edge extension capturing console logs | Content script, console interceptor, WebSocket client, popup UI |
| **`console-logs-mcp-shared`** | Shared TypeScript types and Zod schemas | LogMessage, FilterOptions, SearchOptions, TabInfo types |

### Data Flow

1. **Capture**: Extension content script intercepts `console.log/warn/error/etc` in browser tabs
2. **Batch**: Logs are batched and sent via WebSocket to server (default: 50 logs per 100ms)
3. **Store**: Server stores logs in-memory (max 10,000 by default) with filtering/search indexes
4. **Query**: AI assistant queries logs via MCP tools through stdio transport
5. **Respond**: Server returns structured log data with context (timestamps, stack traces, tab info)

### Performance Characteristics

- **Batching**: Reduces network overhead by 95% compared to per-log transmission
- **In-Memory Storage**: Sub-millisecond query response times
- **Indexed Search**: Regex and keyword search optimized with pre-built indexes
- **Minimal Browser Impact**: <1% CPU overhead in typical usage

---

## Development

### Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run in development mode (auto-rebuild on changes)
npm run dev:server    # Server with hot reload
npm run dev:extension # Extension with hot reload
```

### Testing

```bash
npm test
```

### Linting & Formatting

```bash
npm run lint    # Lint with Biome
npm run format  # Format with Biome
```

### Project Structure

```
console-logs-mcp/
├── packages/
│   ├── server/          # MCP + WebSocket server
│   │   ├── src/
│   │   │   ├── index.ts              # Entry point
│   │   │   ├── mcp-server.ts         # MCP tool definitions
│   │   │   ├── websocket-server.ts   # WebSocket server
│   │   │   ├── log-storage.ts        # In-memory storage
│   │   │   ├── filter-engine.ts      # Log filtering
│   │   │   ├── search-engine.ts      # Regex/keyword search
│   │   │   ├── tab-suggester.ts      # Intelligent tab suggestions
│   │   │   ├── sanitizer.ts          # Data sanitization
│   │   │   ├── export-engine.ts      # Export to JSON/CSV/text
│   │   │   └── session-manager.ts    # Session save/load
│   │   └── package.json
│   ├── extension/       # Chrome extension
│   │   ├── src/
│   │   │   ├── background.ts         # Service worker
│   │   │   ├── content-script.ts     # Page injection
│   │   │   ├── lib/
│   │   │   │   ├── console-interceptor.ts  # Intercept console calls
│   │   │   │   └── websocket-client.ts     # WebSocket client
│   │   │   └── popup/                # Extension UI
│   │   ├── public/
│   │   │   ├── manifest.json
│   │   │   └── popup.html
│   │   └── package.json
│   └── shared/          # Shared types
│       ├── src/
│       │   ├── index.ts
│       │   └── types.ts              # LogMessage, FilterOptions, etc.
│       └── package.json
└── package.json
```

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines.

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Community

### Get Support

- **GitHub Issues**: [Report bugs, request features](https://github.com/vltansky/console-logs-mcp/issues)
- **GitHub Discussions**: [Ask questions, share ideas](https://github.com/vltansky/console-logs-mcp/discussions)
- **Documentation**: See [CLAUDE.md](./CLAUDE.md) for architecture details

### Show Your Support

If console-logs-mcp improves your debugging workflow:

- **Star the repository** on [GitHub](https://github.com/vltansky/console-logs-mcp)
- **Share on social media** with #consolelogsmcp
- **Write about your experience** on your blog
- **Create tutorials** and share with the community
- **Contribute** improvements and bug fixes

---

<div align="center">

**Built with care for developers by developers**

[GitHub](https://github.com/vltansky/console-logs-mcp) • [NPM](https://www.npmjs.com/package/console-logs-mcp)

---

Built with [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

</div>
