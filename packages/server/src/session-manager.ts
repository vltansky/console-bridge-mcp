import { randomUUID } from 'node:crypto';
import type { LogMessage, Session } from 'console-bridge-shared';

export class SessionManager {
  private sessions = new Map<string, Session>();
  private sessionsByName = new Map<string, string>(); // name -> id mapping

  save(logs: LogMessage[], name?: string, description?: string): string {
    const sessionId = randomUUID();
    const tabs = [...new Set(logs.map((l) => l.tabId))];

    // Check if name already exists
    if (name && this.sessionsByName.has(name)) {
      throw new Error(`Session with name "${name}" already exists`);
    }

    const session: Session = {
      id: sessionId,
      name,
      description,
      startTime: logs[0]?.timestamp || Date.now(),
      endTime: logs[logs.length - 1]?.timestamp || Date.now(),
      logCount: logs.length,
      tabs,
      logs,
      created: Date.now(),
    };

    this.sessions.set(sessionId, session);

    // Add name mapping if provided
    if (name) {
      this.sessionsByName.set(name, sessionId);
    }

    return sessionId;
  }

  /**
   * Load session by ID or name
   */
  load(sessionIdOrName: string): LogMessage[] | null {
    const session = this.resolveSession(sessionIdOrName);
    if (!session) {
      return null;
    }
    return session.logs;
  }

  /**
   * Resolve session ID from ID or name
   */
  private resolveSessionId(sessionIdOrName: string): string | null {
    // Try direct ID lookup first
    if (this.sessions.has(sessionIdOrName)) {
      return sessionIdOrName;
    }

    // Try name lookup
    const idFromName = this.sessionsByName.get(sessionIdOrName);
    if (idFromName) {
      return idFromName;
    }

    return null;
  }

  /**
   * Resolve session from ID or name
   */
  private resolveSession(sessionIdOrName: string): Session | null {
    const sessionId = this.resolveSessionId(sessionIdOrName);
    if (!sessionId) {
      return null;
    }
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get session by ID or name
   */
  get(sessionIdOrName: string): Session | null {
    return this.resolveSession(sessionIdOrName);
  }

  list(): Session[] {
    return Array.from(this.sessions.values()).map((session) => ({
      ...session,
      logs: [], // Don't include logs in list view for performance
    }));
  }

  /**
   * Delete session by ID or name
   */
  delete(sessionIdOrName: string): boolean {
    const session = this.resolveSession(sessionIdOrName);
    if (!session) {
      return false;
    }

    // Remove name mapping if exists
    if (session.name) {
      this.sessionsByName.delete(session.name);
    }

    return this.sessions.delete(session.id);
  }

  clear(): void {
    this.sessions.clear();
    this.sessionsByName.clear();
  }

  getCount(): number {
    return this.sessions.size;
  }
}
