export interface AuditLogEntry {
  id?: string;
  agencyId: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

const SENSITIVE_KEYS = [
  "token",
  "secret",
  "key",
  "authorization",
  "password",
  "signature",
  "access_token",
  "refresh_token",
];

/**
 * Sanitizes metadata to strictly prevent secrets or API credentials from leaking into logs.
 */
export function sanitizeLogMetadata(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeLogMetadata);
  }

  const sanitized: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s));
    if (isSensitive) {
      sanitized[k] = "[REDACTED]";
    } else if (typeof v === "object" && v !== null) {
      sanitized[k] = sanitizeLogMetadata(v);
    } else {
      sanitized[k] = v;
    }
  }

  return sanitized;
}

export class AuditLogger {
  private inMemoryLogs: AuditLogEntry[] = [];

  log(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
    const sanitizedEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      metadata: sanitizeLogMetadata(entry.metadata || {}),
      timestamp: new Date().toISOString(),
    };

    this.inMemoryLogs.unshift(sanitizedEntry);
    if (this.inMemoryLogs.length > 500) {
      this.inMemoryLogs.pop();
    }

    return sanitizedEntry;
  }

  getLogs(agencyId?: string, limit = 50): AuditLogEntry[] {
    if (agencyId) {
      return this.inMemoryLogs.filter((l) => l.agencyId === agencyId).slice(0, limit);
    }
    return this.inMemoryLogs.slice(0, limit);
  }
}

export const auditLogger = new AuditLogger();
