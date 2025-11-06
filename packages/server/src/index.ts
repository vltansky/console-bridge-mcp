import { LogStorage } from './log-storage.js';
import { McpServer } from './mcp-server.js';
import { ConsoleWebSocketServer } from './websocket-server.js';

// Configuration from environment variables
const config = {
  wsPort: Number.parseInt(process.env.CONSOLE_MCP_PORT || '3333'),
  maxLogs: Number.parseInt(process.env.CONSOLE_MCP_MAX_LOGS || '10000'),
  sanitizeLogs: process.env.CONSOLE_MCP_SANITIZE_LOGS === 'true',
};

// Initialize log storage
const storage = new LogStorage({ maxLogs: config.maxLogs });

// Start WebSocket server
const wsServer = new ConsoleWebSocketServer(storage, {
  port: config.wsPort,
  host: 'localhost',
});

// Start MCP server
const mcpServer = new McpServer(storage, wsServer);

// Graceful shutdown
process.on('SIGINT', () => {
  wsServer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  wsServer.close();
  process.exit(0);
});

// Start the MCP server
try {
  await mcpServer.start();
} catch (error) {
  process.exit(1);
}
