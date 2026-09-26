import { describe, it, expect, vi } from "vitest";
import {
  AuditLogger,
  sanitizeLogMetadata,
} from "../lib/security/audit-logger";
import { RateLimiter } from "../lib/security/rate-limiter";
import { executeWithRetry, PermanentError } from "../lib/integrations/retry";

describe("Phase 7: Production Hardening, Security & Resiliency", () => {
  describe("Audit Logging & Credential Redaction", () => {
    it("redacts sensitive credential keys in single and nested objects", () => {
      const payload = {
        agencyId: "agency_aura_001",
        campaignName: "Botox Promo",
        apiKey: "sk_live_1234567890",
        accessToken: "EAABwz...",
        nested: {
          clientSecret: "super_secret_99",
          userPassword: "secretPassword!",
          signature: "ed25519_hex...",
          safeField: "safeValue",
        },
        list: [
          { token: "tok_abc" },
          { id: "campaign_1", status: "active" },
        ],
      };

      const sanitized = sanitizeLogMetadata(payload);

      expect(sanitized.apiKey).toBe("[REDACTED]");
      expect(sanitized.accessToken).toBe("[REDACTED]");
      expect(sanitized.campaignName).toBe("Botox Promo");
      expect(sanitized.nested.clientSecret).toBe("[REDACTED]");
      expect(sanitized.nested.userPassword).toBe("[REDACTED]");
      expect(sanitized.nested.signature).toBe("[REDACTED]");
      expect(sanitized.nested.safeField).toBe("safeValue");
      expect(sanitized.list[0].token).toBe("[REDACTED]");
      expect(sanitized.list[1].id).toBe("campaign_1");
      expect(sanitized.list[1].status).toBe("active");
    });

    it("creates audit log entries with generated ID, ISO timestamp, and stores in memory", () => {
      const logger = new AuditLogger();
      const entry = logger.log({
        agencyId: "agency_aura_001",
        userId: "usr_admin_123",
        action: "campaign.update_budget",
        resourceType: "campaign",
        resourceId: "camp_botox_01",
        metadata: {
          previousBudget: 1500,
          newBudget: 2500,
          authToken: "bearer_xyz",
        },
      });

      expect(entry.id).toBeDefined();
      expect(entry.id).toMatch(/^audit_/);
      expect(entry.timestamp).toBeDefined();
      expect(entry.metadata?.authToken).toBe("[REDACTED]");
      expect(entry.metadata?.newBudget).toBe(2500);

      const retrieved = logger.getLogs("agency_aura_001");
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].id).toBe(entry.id);
    });
  });

  describe("Token Bucket Rate Limiter", () => {
    it("allows requests within quota and rejects when tokens exhausted", () => {
      const limiter = new RateLimiter(3, 60000); // 3 tokens per 60s
      const id = "client_ip_192_168_1_1";

      const r1 = limiter.check(id);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = limiter.check(id);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = limiter.check(id);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      // 4th request must be blocked
      const r4 = limiter.check(id);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
    });

    it("isolates rate limit buckets across different client identifiers", () => {
      const limiter = new RateLimiter(1, 60000);
      const clientA = "client_A";
      const clientB = "client_B";

      expect(limiter.check(clientA).allowed).toBe(true);
      expect(limiter.check(clientA).allowed).toBe(false);

      // Client B should still have full quota
      expect(limiter.check(clientB).allowed).toBe(true);
    });
  });

  describe("Resilient Exponential Backoff & Retry", () => {
    it("resolves immediately when task succeeds on first attempt", async () => {
      const mockTask = vi.fn().mockResolvedValue("success_payload");

      const result = await executeWithRetry(mockTask, { maxAttempts: 3 });
      expect(result).toBe("success_payload");
      expect(mockTask).toHaveBeenCalledTimes(1);
    });

    it("retries on transient failure and recovers if task succeeds on subsequent attempt", async () => {
      let attempts = 0;
      const mockTask = vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error("Temporary network timeout 503");
        }
        return "recovered_data";
      });

      const result = await executeWithRetry(mockTask, {
        maxAttempts: 3,
        initialDelayMs: 10,
        jitter: false,
      });

      expect(result).toBe("recovered_data");
      expect(attempts).toBe(2);
    });

    it("aborts immediately without retry on PermanentError", async () => {
      const mockTask = vi.fn().mockImplementation(async () => {
        throw new PermanentError("Invalid API configuration");
      });

      await expect(
        executeWithRetry(mockTask, {
          maxAttempts: 5,
          initialDelayMs: 10,
        })
      ).rejects.toThrow("Invalid API configuration");

      expect(mockTask).toHaveBeenCalledTimes(1);
    });

    it("classifies HTTP 401 unauthorized as PermanentError and does not retry", async () => {
      const mockTask = vi.fn().mockImplementation(async () => {
        const err: any = new Error("Unauthorized");
        err.status = 401;
        throw err;
      });

      await expect(
        executeWithRetry(mockTask, {
          maxAttempts: 4,
          initialDelayMs: 10,
        })
      ).rejects.toThrow("Permanent HTTP error: 401");

      expect(mockTask).toHaveBeenCalledTimes(1);
    });
  });
});
