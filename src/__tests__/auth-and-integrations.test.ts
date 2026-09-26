import { describe, it, expect } from "vitest";
import {
  authenticateUser,
  PRECONFIGURED_USERS,
  PRECONFIGURED_CREDENTIALS,
} from "../lib/auth/users";
import {
  saveStoredCredentials,
  getStoredCredentials,
  maskCredential,
  getEffectiveMetaCredentials,
  getEffectiveGoogleCredentials,
  getEffectiveGhlCredentials,
} from "../lib/integrations/credentials-store";

describe("Authentication & In-App API Key Store", () => {
  describe("Preconfigured User Authentication", () => {
    it("successfully authenticates Super Admin with correct credentials", () => {
      const user = authenticateUser("admin@adfunnel.ai", "Admin@AdFunnel2026!");
      expect(user).not.toBeNull();
      expect(user?.role).toBe("super_admin");
      expect(user?.fullName).toBe("Alex Vance");
    });

    it("successfully authenticates Clinic Manager with correct credentials", () => {
      const user = authenticateUser("manager@auramedspa.com", "Manager@Aura2026!");
      expect(user).not.toBeNull();
      expect(user?.role).toBe("agency_admin");
    });

    it("successfully authenticates Analytics Viewer with correct credentials", () => {
      const user = authenticateUser("viewer@auramedspa.com", "Viewer@Aura2026!");
      expect(user).not.toBeNull();
      expect(user?.role).toBe("viewer");
    });

    it("rejects invalid password", () => {
      const user = authenticateUser("admin@adfunnel.ai", "wrong-password");
      expect(user).toBeNull();
    });

    it("handles uppercase and whitespace email variations", () => {
      const user = authenticateUser("  ADMIN@ADFUNNEL.AI  ", "Admin@AdFunnel2026!");
      expect(user).not.toBeNull();
      expect(user?.email).toBe("admin@adfunnel.ai");
    });
  });

  describe("In-App Dynamic Credentials Store", () => {
    it("correctly masks sensitive credentials", () => {
      expect(maskCredential("EAABwz1234567890abcdef")).toBe("EAAB...cdef");
      expect(maskCredential("short")).toBe("******");
      expect(maskCredential("")).toBe("");
    });

    it("saves and activates credentials dynamically without restarting", () => {
      saveStoredCredentials({
        meta: {
          systemUserToken: "EAAB_test_dynamic_token_live_123",
          adAccountId: "act_9876543210",
        },
        google: {
          developerToken: "dev_tok_live_dynamic_456",
          customerId: "999-888-7777",
        },
        ghl: {
          apiKey: "pit-dynamic-live-ghl-789",
          locationId: "loc_custom_spa_99",
        },
      });

      const meta = getEffectiveMetaCredentials();
      expect(meta.systemUserToken).toBe("EAAB_test_dynamic_token_live_123");
      expect(meta.adAccountId).toBe("act_9876543210");

      const google = getEffectiveGoogleCredentials();
      expect(google.developerToken).toBe("dev_tok_live_dynamic_456");
      expect(google.customerId).toBe("999-888-7777");

      const ghl = getEffectiveGhlCredentials();
      expect(ghl.apiKey).toBe("pit-dynamic-live-ghl-789");
      expect(ghl.locationId).toBe("loc_custom_spa_99");
    });
  });
});
