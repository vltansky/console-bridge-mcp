import type { ExtensionMessage, ServerMessage, TabInfo } from '@console-mcp/shared';
import { ExtensionMessageSchema } from '@console-mcp/shared';
import { WebSocket, WebSocketServer } from 'ws';
import type { LogStorage } from './log-storage.js';

export interface WebSocketServerConfig {
  port?: number;
  host?: string;
  heartbeatInterval?: number;
}

interface ClientInfo {
  ws: WebSocket;
  isAlive: boolean;
  lastHeartbeat: number;
}

export class ConsoleWebSocketServer {
  private wss: WebSocketServer;
  private clients = new Map<WebSocket, ClientInfo>();
  private tabs = new Map<number, TabInfo>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly storage: LogStorage;
  private readonly config: Required<WebSocketServerConfig>;

  constructor(storage: LogStorage, config: WebSocketServerConfig = {}) {
    this.storage = storage;
    this.config = {
      port: config.port ?? 3333,
      host: config.host ?? 'localhost',
      heartbeatInterval: config.heartbeatInterval ?? 30000,
    };

    this.wss = new WebSocketServer({
      port: this.config.port,
      host: this.config.host,
    });

    this.wss.on('connection', this.handleConnection);
    this.wss.on('error', (_error) => {
      // Silently handle errors to avoid interfering with MCP stdio
    });

    this.startHeartbeat();
  }

  private handleConnection = (ws: WebSocket): void => {
    const clientInfo: ClientInfo = {
      ws,
      isAlive: true,
      lastHeartbeat: Date.now(),
    };
    this.clients.set(ws, clientInfo);

    ws.on('message', (data: Buffer) => {
      try {
        const rawMessage = JSON.parse(data.toString());
        const message = ExtensionMessageSchema.parse(rawMessage);
        this.handleMessage(message, clientInfo);
      } catch (_error) {
        // Silently handle invalid messages
      }
    });

    ws.on('pong', () => {
      clientInfo.isAlive = true;
      clientInfo.lastHeartbeat = Date.now();
    });

    ws.on('close', () => {
      this.clients.delete(ws);
    });

    ws.on('error', (_error) => {
      // Silently handle client errors
    });
  };

  private handleMessage(message: ExtensionMessage, client: ClientInfo): void {
    switch (message.type) {
      case 'log':
        this.storage.add(message.data);
        break;

      case 'tab_opened':
        this.tabs.set(message.data.id, message.data);
        break;

      case 'tab_closed':
        this.tabs.delete(message.data.tabId);
        break;

      case 'heartbeat':
        client.lastHeartbeat = message.data.timestamp;
        client.isAlive = true;
        break;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      for (const [ws, client] of this.clients.entries()) {
        if (!client.isAlive) {
          ws.terminate();
          this.clients.delete(ws);
          continue;
        }

        client.isAlive = false;
        ws.ping();

        const message: ServerMessage = {
          type: 'ping',
          data: { timestamp: now },
        };
        this.send(ws, message);
      }
    }, this.config.heartbeatInterval);
  }

  send(ws: WebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(message: ServerMessage): void {
    for (const { ws } of this.clients.values()) {
      this.send(ws, message);
    }
  }

  getTabs(): TabInfo[] {
    return Array.from(this.tabs.values());
  }

  getTab(tabId: number): TabInfo | undefined {
    return this.tabs.get(tabId);
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
  }
}
