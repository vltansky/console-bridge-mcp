import type { FilterOptions, KeywordSearchParams, SearchParams } from 'console-logs-mcp-shared';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ExportEngine } from './export-engine.js';
import type { LogStorage } from './log-storage.js';
import { Sanitizer } from './sanitizer.js';
import { SearchEngine } from './search-engine.js';
import { SessionManager } from './session-manager.js';
import { TabSuggester, type SuggestionContext } from './tab-suggester.js';
import type { ConsoleWebSocketServer } from './websocket-server.js';

export class McpServer {
  private server: Server;
  private storage: LogStorage;
  private wsServer: ConsoleWebSocketServer;
  private searchEngine: SearchEngine;
  private sanitizer: Sanitizer;
  private exportEngine: ExportEngine;
  private sessionManager: SessionManager;
  private tabSuggester: TabSuggester;

  constructor(storage: LogStorage, wsServer: ConsoleWebSocketServer) {
    this.storage = storage;
    this.wsServer = wsServer;
    this.searchEngine = new SearchEngine();
    this.sanitizer = new Sanitizer();
    this.exportEngine = new ExportEngine();
    this.sessionManager = new SessionManager();
    this.tabSuggester = new TabSuggester();

    this.server = new Server(
      {
        name: 'console-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'console_list_logs',
          description:
            'List captured console logs with pagination and filtering. Supports filtering by log level, tab, URL pattern, and time range.',
          inputSchema: {
            type: 'object',
            properties: {
              levels: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['log', 'info', 'warn', 'error', 'debug'],
                },
                description: 'Filter by log levels',
              },
              tabId: {
                type: 'number',
                description: 'Filter by tab ID',
              },
              urlPattern: {
                type: 'string',
                description: 'Filter by URL pattern (regex)',
              },
              after: {
                type: 'string',
                description:
                  'Filter logs after this time (ISO timestamp or relative like "5m", "1h")',
              },
              before: {
                type: 'string',
                description: 'Filter logs before this time',
              },
              sessionId: {
                type: 'string',
                description: 'Filter by session ID',
              },
              limit: {
                type: 'number',
                default: 100,
                description: 'Maximum number of logs to return',
              },
              offset: {
                type: 'number',
                default: 0,
                description: 'Number of logs to skip (for pagination)',
              },
              sanitize: {
                type: 'boolean',
                default: false,
                description: 'Apply sanitization to mask sensitive data',
              },
              includeArgs: {
                type: 'boolean',
                default: false,
                description: 'Include args array in response (can be large)',
              },
              includeStack: {
                type: 'boolean',
                default: false,
                description: 'Include stack traces in response (can be large)',
              },
            },
          },
        },
        {
          name: 'console_get_log',
          description: 'Get a specific log by ID with full details (args, stack, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Log ID',
              },
              sanitize: {
                type: 'boolean',
                default: false,
                description: 'Apply sanitization',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'console_search_logs',
          description:
            'Search logs using regex patterns. Supports searching across message, args, and stack fields with context lines.',
          inputSchema: {
            type: 'object',
            properties: {
              pattern: {
                type: 'string',
                description: 'Regular expression pattern',
              },
              caseSensitive: {
                type: 'boolean',
                default: false,
                description: 'Case sensitive search',
              },
              fields: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['message', 'args', 'stack'],
                },
                default: ['message'],
                description: 'Fields to search in (default: message only for smaller response)',
              },
              contextLines: {
                type: 'number',
                default: 0,
                description: 'Number of context lines before/after match',
              },
              limit: {
                type: 'number',
                default: 100,
                description: 'Maximum number of results',
              },
              filter: {
                type: 'object',
                description: 'Additional filters (same as console_list_logs)',
              },
              includeArgs: {
                type: 'boolean',
                default: false,
                description: 'Include args array in results (can be large)',
              },
              includeStack: {
                type: 'boolean',
                default: false,
                description: 'Include stack traces in results (can be large)',
              },
            },
            required: ['pattern'],
          },
        },
        {
          name: 'console_search_keywords',
          description: 'Search logs using keyword matching with AND/OR logic and exclusions',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Keywords to search for',
              },
              logic: {
                type: 'string',
                enum: ['AND', 'OR'],
                default: 'AND',
                description: 'Logic to combine keywords',
              },
              exclude: {
                type: 'array',
                items: { type: 'string' },
                description: 'Keywords to exclude',
              },
              limit: {
                type: 'number',
                default: 100,
                description: 'Maximum number of results',
              },
              filter: {
                type: 'object',
                description: 'Additional filters',
              },
              includeArgs: {
                type: 'boolean',
                default: false,
                description: 'Include args array in results (can be large)',
              },
              includeStack: {
                type: 'boolean',
                default: false,
                description: 'Include stack traces in results (can be large)',
              },
            },
            required: ['keywords'],
          },
        },
        {
          name: 'console_tail_logs',
          description: 'Stream/tail new logs in real-time with optional filtering',
          inputSchema: {
            type: 'object',
            properties: {
              follow: {
                type: 'boolean',
                default: true,
                description: 'Follow new logs',
              },
              filter: {
                type: 'object',
                description: 'Filters to apply',
              },
              lines: {
                type: 'number',
                default: 10,
                description: 'Number of recent logs to show initially',
              },
            },
          },
        },
        {
          name: 'console_get_tabs',
          description: 'Get information about active tabs',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'console_clear_logs',
          description: 'Clear stored logs with optional filtering',
          inputSchema: {
            type: 'object',
            properties: {
              tabId: {
                type: 'number',
                description: 'Clear logs only for this tab',
              },
              before: {
                type: 'string',
                description: 'Clear logs before this timestamp',
              },
            },
          },
        },
        {
          name: 'console_export_logs',
          description: 'Export logs in various formats (JSON, CSV, TXT)',
          inputSchema: {
            type: 'object',
            properties: {
              format: {
                type: 'string',
                enum: ['json', 'csv', 'txt'],
                description: 'Export format',
              },
              filter: {
                type: 'object',
                description: 'Filters to apply',
              },
              fields: {
                type: 'array',
                items: { type: 'string' },
                description: 'Fields to include',
              },
              prettyPrint: {
                type: 'boolean',
                default: false,
                description: 'Pretty print JSON',
              },
            },
            required: ['format'],
          },
        },
        {
          name: 'console_save_session',
          description: 'Save current logs as a named session for later retrieval',
          inputSchema: {
            type: 'object',
            properties: {
              filter: {
                type: 'object',
                description: 'Filters to select logs',
              },
              name: {
                type: 'string',
                description: 'Optional human-readable session name (e.g., "bug-123", "auth-error-investigation")',
              },
              description: {
                type: 'string',
                description: 'Optional description of what this session contains',
              },
            },
          },
        },
        {
          name: 'console_load_session',
          description: 'Load logs from a saved session by ID or name',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: {
                type: 'string',
                description: 'Session ID or name (e.g., "bug-123" or UUID)',
              },
            },
            required: ['sessionId'],
          },
        },
        {
          name: 'console_list_sessions',
          description: 'List all saved sessions',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'console_get_stats',
          description: 'Get statistics about captured logs',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'console_suggest_tab',
          description:
            'Suggest the most relevant browser tab based on project context. Returns ranked tab suggestions with reasoning. Use this to intelligently select which tab to focus on.',
          inputSchema: {
            type: 'object',
            properties: {
              urlPatterns: {
                type: 'array',
                items: { type: 'string' },
                description: 'URL patterns to match (regex or substring)',
              },
              workingDirectory: {
                type: 'string',
                description: 'Current working directory for project context',
              },
              ports: {
                type: 'array',
                items: { type: 'number' },
                description: 'Expected port numbers (e.g., [3000, 5173])',
              },
              domains: {
                type: 'array',
                items: { type: 'string' },
                description: 'Expected domains (e.g., ["localhost", "myapp.dev"])',
              },
              limit: {
                type: 'number',
                default: 5,
                description: 'Maximum number of suggestions to return',
              },
            },
          },
        },
        {
          name: 'console_execute_js',
          description:
            'Execute JavaScript code in the browser tab context. Useful for reproducing issues, testing fixes, or querying application state.',
          inputSchema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'JavaScript code to execute',
              },
              tabId: {
                type: 'number',
                description: 'Optional tab ID (if not provided, executes in active tab)',
              },
            },
            required: ['code'],
          },
        },
        {
          name: 'console_get_page_info',
          description:
            'Get information about the current page (title, URL, optionally HTML). Useful for understanding page context during debugging.',
          inputSchema: {
            type: 'object',
            properties: {
              tabId: {
                type: 'number',
                description: 'Optional tab ID',
              },
              includeHtml: {
                type: 'boolean',
                default: false,
                description: 'Include full page HTML (can be large)',
              },
            },
          },
        },
        {
          name: 'console_query_dom',
          description:
            'Query DOM elements using CSS selectors and extract properties. Useful for inspecting page state and element attributes.',
          inputSchema: {
            type: 'object',
            properties: {
              selector: {
                type: 'string',
                description: 'CSS selector (e.g., ".error-message", "#submit-btn")',
              },
              tabId: {
                type: 'number',
                description: 'Optional tab ID',
              },
              properties: {
                type: 'array',
                items: { type: 'string' },
                description: 'Element properties to extract (e.g., ["textContent", "className", "value"])',
              },
            },
            required: ['selector'],
          },
        },
      ],
    }));

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'console://context',
          name: 'Project Context',
          description: 'Current project context including working directory and environment',
          mimeType: 'application/json',
        },
      ],
    }));

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      if (request.params.uri === 'console://context') {
        const cwd = process.cwd();
        const projectName = cwd.split(/[/\\]/).pop() || 'unknown';
        const commonPorts = this.tabSuggester.detectCommonPorts(cwd);

        return {
          contents: [
            {
              uri: 'console://context',
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  workingDirectory: cwd,
                  projectName,
                  suggestedPorts: commonPorts,
                  timestamp: Date.now(),
                },
                null,
                2,
              ),
            },
          ],
        };
      }
      throw new Error(`Unknown resource: ${request.params.uri}`);
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: 'use-console-mcp',
          description:
            'Quick shortcut to use Console MCP tools for querying browser console logs. Use this prompt to access console logs with filters, search, and analysis.',
        },
      ],
    }));

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name === 'use-console-mcp') {
        return {
          description: 'Use Console MCP to query browser console logs',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Use Console MCP tools to query browser console logs. Here are the available tools:

**Tab Selection (Start Here):**
- console_suggest_tab: Intelligently suggest relevant tabs based on project context
- console_get_tabs: Get all active browser tabs with log counts

**Query & Filter:**
- console_list_logs: List logs with filtering (level, tab, URL, time range)
- console_get_log: Get a specific log by ID
- console_tail_logs: Stream recent logs in real-time

**Search:**
- console_search_logs: Search logs using regex patterns
- console_search_keywords: Search logs using keywords (AND/OR logic)

**Analytics:**
- console_get_stats: Get statistics about captured logs

**Management:**
- console_clear_logs: Clear stored logs
- console_export_logs: Export logs in JSON, CSV, or text format

**Sessions:**
- console_save_session: Save current logs as a named session
- console_load_session: Load a previously saved session
- console_list_sessions: List all saved sessions

**Tab Selection Strategy:**
1. If the user's query is about a specific project/site, use console_suggest_tab with:
   - workingDirectory from console://context resource
   - urlPatterns based on user context (e.g., ["localhost"], project name)
   - ports from common dev servers (3000, 5173, 8080, etc.)
2. Review suggestions and select the top-ranked tab (highest score)
3. If multiple tabs have similar scores, ask the user to clarify
4. Use the selected tab's ID in subsequent queries (tabId filter)

**Common usage patterns:**
- "show errors" → First suggest tab, then console_list_logs with levels: ["error"] and tabId
- "from last X minutes" → Use after parameter with relative time like "5m", "1h"
- "from localhost:3000" → Use console_suggest_tab with ports: [3000]
- "search for X" → Use console_search_logs or console_search_keywords with tabId filter
- "statistics" → Use console_get_stats
- "export" → Use console_export_logs

Use the appropriate Console MCP tools to help the user query and analyze their browser console logs.`,
              },
            },
          ],
        };
      }
      throw new Error(`Unknown prompt: ${request.params.name}`);
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'console_list_logs':
            return await this.handleListLogs(args as any);

          case 'console_get_log':
            return await this.handleGetLog(args as any);

          case 'console_search_logs':
            return await this.handleSearchLogs(args as any);

          case 'console_search_keywords':
            return await this.handleSearchKeywords(args as any);

          case 'console_tail_logs':
            return await this.handleTailLogs(args as any);

          case 'console_get_tabs':
            return await this.handleGetTabs();

          case 'console_clear_logs':
            return await this.handleClearLogs(args as any);

          case 'console_export_logs':
            return await this.handleExportLogs(args as any);

          case 'console_save_session':
            return await this.handleSaveSession(args as any);

          case 'console_load_session':
            return await this.handleLoadSession(args as any);

          case 'console_list_sessions':
            return await this.handleListSessions();

          case 'console_get_stats':
            return await this.handleGetStats();

          case 'console_suggest_tab':
            return await this.handleSuggestTab(args as any);

          case 'console_execute_js':
            return await this.handleExecuteJS(args as any);

          case 'console_get_page_info':
            return await this.handleGetPageInfo(args as any);

          case 'console_query_dom':
            return await this.handleQueryDOM(args as any);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleListLogs(args: {
    levels?: string[];
    tabId?: number;
    urlPattern?: string;
    after?: string;
    before?: string;
    sessionId?: string;
    limit?: number;
    offset?: number;
    sanitize?: boolean;
    includeArgs?: boolean;
    includeStack?: boolean;
  }) {
    const filter: FilterOptions = {
      levels: args.levels as any,
      tabId: args.tabId,
      urlPattern: args.urlPattern,
      after: args.after,
      before: args.before,
      sessionId: args.sessionId,
    };

    let logs = this.storage.getAll(filter);
    const total = logs.length;

    // Pagination
    const offset = args.offset || 0;
    const limit = args.limit || 100;
    logs = logs.slice(offset, offset + limit);

    // Sanitize if requested
    if (args.sanitize) {
      logs = this.sanitizer.sanitizeMultiple(logs);
    }

    // By default, exclude args and stack (minimal response)
    // User can opt-in to include them
    logs = logs.map((log) => {
      const minimal: any = {
        id: log.id,
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        tabId: log.tabId,
        url: log.url,
        sessionId: log.sessionId,
      };

      if (args.includeArgs) {
        minimal.args = log.args;
      }

      if (args.includeStack && log.stack) {
        minimal.stack = log.stack;
      }

      return minimal;
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            logs,
            total,
            offset,
            limit,
            hasMore: offset + limit < total,
          }),
        },
      ],
    };
  }

  private async handleGetLog(args: { id: string; sanitize?: boolean }) {
    const logs = this.storage.getAll();
    let log = logs.find((l) => l.id === args.id);

    if (!log) {
      throw new Error(`Log not found: ${args.id}`);
    }

    if (args.sanitize) {
      log = this.sanitizer.sanitize(log);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(log, null, 2),
        },
      ],
    };
  }

  private async handleSearchLogs(args: {
    pattern: string;
    caseSensitive?: boolean;
    fields?: Array<'message' | 'args' | 'stack'>;
    contextLines?: number;
    limit?: number;
    filter?: FilterOptions;
    includeArgs?: boolean;
    includeStack?: boolean;
  }) {
    const logs = args.filter ? this.storage.getAll(args.filter) : this.storage.getAll();

    const searchParams: SearchParams = {
      pattern: args.pattern,
      caseSensitive: args.caseSensitive,
      fields: args.fields || ['message'],
      contextLines: args.contextLines,
      limit: args.limit,
    };

    const result = this.searchEngine.search(logs, searchParams);

    // Strip args/stack from results unless explicitly requested
    if (!args.includeArgs || !args.includeStack) {
      result.matches = result.matches.map((match) => ({
        ...match,
        log: this.stripLogFields(match.log, args.includeArgs, args.includeStack),
        context: match.context
          ? {
              before: match.context.before.map((log) =>
                this.stripLogFields(log, args.includeArgs, args.includeStack),
              ),
              after: match.context.after.map((log) =>
                this.stripLogFields(log, args.includeArgs, args.includeStack),
              ),
            }
          : undefined,
      }));
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result),
        },
      ],
    };
  }

  private async handleSearchKeywords(args: {
    keywords: string[];
    logic?: 'AND' | 'OR';
    exclude?: string[];
    limit?: number;
    filter?: FilterOptions;
    includeArgs?: boolean;
    includeStack?: boolean;
  }) {
    const logs = args.filter ? this.storage.getAll(args.filter) : this.storage.getAll();

    const searchParams: KeywordSearchParams = {
      keywords: args.keywords,
      logic: args.logic,
      exclude: args.exclude,
      limit: args.limit,
    };

    const result = this.searchEngine.searchKeywords(logs, searchParams);

    // Strip args/stack from results unless explicitly requested
    if (!args.includeArgs || !args.includeStack) {
      result.matches = result.matches.map((match) => ({
        ...match,
        log: this.stripLogFields(match.log, args.includeArgs, args.includeStack),
        context: match.context
          ? {
              before: match.context.before.map((log) =>
                this.stripLogFields(log, args.includeArgs, args.includeStack),
              ),
              after: match.context.after.map((log) =>
                this.stripLogFields(log, args.includeArgs, args.includeStack),
              ),
            }
          : undefined,
      }));
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result),
        },
      ],
    };
  }

  private async handleTailLogs(args: {
    follow?: boolean;
    filter?: FilterOptions;
    lines?: number;
  }) {
    const lines = args.lines || 10;
    const allLogs = args.filter ? this.storage.getAll(args.filter) : this.storage.getAll();
    const recentLogs = allLogs.slice(-lines);

    // Note: This is a simplified implementation
    // In a real streaming scenario, we'd use MCP's sampling feature
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              logs: recentLogs,
              total: allLogs.length,
              message: 'Note: Real-time streaming requires MCP sampling support',
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  private async handleGetTabs() {
    const tabs = this.wsServer.getTabs();
    const tabStats = tabs.map((tab) => ({
      ...tab,
      logCount: this.storage.getTabCount(tab.id),
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              tabs: tabStats,
              total: tabs.length,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  private async handleClearLogs(args: { tabId?: number; before?: string }) {
    this.storage.clear(args);
    return {
      content: [
        {
          type: 'text',
          text: 'Logs cleared successfully',
        },
      ],
    };
  }

  private async handleExportLogs(args: {
    format: 'json' | 'csv' | 'txt';
    filter?: FilterOptions;
    fields?: string[];
    prettyPrint?: boolean;
  }) {
    const logs = args.filter ? this.storage.getAll(args.filter) : this.storage.getAll();
    const exported = this.exportEngine.export(logs, args.format, {
      fields: args.fields as any,
      prettyPrint: args.prettyPrint,
    });

    return {
      content: [
        {
          type: 'text',
          text: exported,
        },
      ],
    };
  }

  private async handleSaveSession(args: {
    filter?: FilterOptions;
    name?: string;
    description?: string;
  }) {
    const logs = args.filter ? this.storage.getAll(args.filter) : this.storage.getAll();
    const sessionId = this.sessionManager.save(logs, args.name, args.description);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              sessionId,
              name: args.name,
              description: args.description,
              logCount: logs.length,
              message: args.name
                ? `Session saved as "${args.name}" (ID: ${sessionId})`
                : `Session saved with ID: ${sessionId}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  private async handleLoadSession(args: { sessionId: string }) {
    const logs = this.sessionManager.load(args.sessionId);
    if (!logs) {
      throw new Error(`Session not found: ${args.sessionId}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ logs, total: logs.length }, null, 2),
        },
      ],
    };
  }

  private async handleListSessions() {
    const sessions = this.sessionManager.list();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ sessions, total: sessions.length }, null, 2),
        },
      ],
    };
  }

  private async handleGetStats() {
    const stats = {
      totalLogs: this.storage.getTotalCount(),
      activeTabs: this.storage.getAllTabs().length,
      wsConnections: this.wsServer.getConnectionCount(),
      sessions: this.sessionManager.getCount(),
      tabs: this.wsServer.getTabs().map((tab) => ({
        id: tab.id,
        url: tab.url,
        logCount: this.storage.getTabCount(tab.id),
      })),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  private async handleSuggestTab(args: {
    urlPatterns?: string[];
    workingDirectory?: string;
    ports?: number[];
    domains?: string[];
    limit?: number;
  }) {
    const tabs = this.wsServer.getTabs();

    if (tabs.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                suggestions: [],
                message:
                  'No browser tabs currently connected. Make sure the Console MCP extension is installed and active.',
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const context: SuggestionContext = {
      urlPatterns: args.urlPatterns,
      workingDirectory: args.workingDirectory || process.cwd(),
      ports: args.ports,
      domains: args.domains,
    };

    const suggestions = this.tabSuggester.suggestTabs(
      tabs,
      (tabId) => this.storage.getAll({ tabId }),
      context,
    );

    const limit = args.limit || 5;
    const topSuggestions = suggestions.slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              suggestions: topSuggestions.map((s) => ({
                tabId: s.tab.id,
                url: s.tab.url,
                title: s.tab.title,
                score: s.score,
                reasons: s.reasons,
                logCount: s.logCount,
                lastActivity: s.lastActivity,
              })),
              total: suggestions.length,
              context: {
                workingDirectory: context.workingDirectory,
                appliedFilters: {
                  urlPatterns: args.urlPatterns,
                  ports: args.ports,
                  domains: args.domains,
                },
              },
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  private stripLogFields(log: any, includeArgs?: boolean, includeStack?: boolean): any {
    const minimal: any = {
      id: log.id,
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      tabId: log.tabId,
      url: log.url,
      sessionId: log.sessionId,
    };

    if (includeArgs && log.args) {
      minimal.args = log.args;
    }

    if (includeStack && log.stack) {
      minimal.stack = log.stack;
    }

    return minimal;
  }

  private async handleExecuteJS(args: { code: string; tabId?: number }) {
    try {
      const result = await this.wsServer.executeJS(args.code, args.tabId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                result,
                code: args.code,
                tabId: args.tabId,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to execute JavaScript: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleGetPageInfo(args: { tabId?: number; includeHtml?: boolean }) {
    try {
      const pageInfo = await this.wsServer.getPageInfo(args.tabId, args.includeHtml);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                title: pageInfo.title,
                url: pageInfo.url,
                html: pageInfo.html,
                tabId: args.tabId,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get page info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleQueryDOM(args: { selector: string; tabId?: number; properties?: string[] }) {
    try {
      const elements = await this.wsServer.queryDOM(args.selector, args.tabId, args.properties);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                selector: args.selector,
                elements,
                count: elements.length,
                tabId: args.tabId,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to query DOM: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
