import { describe, it, expect } from "vitest";
import { dbService } from "../lib/db/service";
import { DEMO_CLIENTS, DEMO_DAILY_RECORDS } from "../lib/demo-data";
import { calculateDerivedMetrics } from "../lib/metrics";

describe("Phase 2: Database Schema & Entity Integrity", () => {
  it("verifies multi-tenant client structure conforms to schema constraints", async () => {
    const clients = await dbService.getClients();
    expect(clients.length).toBeGreaterThanOrEqual(3);

    clients.forEach((client) => {
      expect(client.id).toBeDefined();
      expect(client.name).toBeTruthy();
      expect(client.currency).toBe("USD");
      expect(["active", "paused", "archived"]).toContain(client.status);
    });
  });

  it("verifies treatments have non-negative target CPL and target ROAS", async () => {
    const treatments = await dbService.getTreatments();
    expect(treatments.length).toBeGreaterThan(0);

    treatments.forEach((t) => {
      expect(t.name).toBeTruthy();
      expect(t.target_cpl).toBeGreaterThan(0);
      expect(t.target_roas).toBeGreaterThan(0);
      expect(t.is_active).toBe(true);
    });
  });

  it("verifies daily metrics data matches reference spreadsheet requirements", async () => {
    const records = await dbService.getDailyMetrics("client_aura");
    expect(records.length).toBeGreaterThanOrEqual(10);

    // Verify Botox records for Sep 23, 24, 25
    const botox23 = records.find(
      (r) => r.treatmentId === "t_botox" && r.displayDate === "9/23"
    );
    expect(botox23).toBeDefined();
    expect(botox23.spend).toBe(500);
    expect(botox23.leads).toBe(60);
    expect(botox23.apptsSelf).toBe(15);
    expect(botox23.apptsSetter).toBe(5);
    expect(botox23.sales).toBe(2);
    expect(botox23.revenue).toBe(150);

    const derived23 = calculateDerivedMetrics(botox23);
    expect(derived23.cpl).toBe(8.33);
    expect(derived23.leadToApptPct).toBe(33.3);
    expect(derived23.apptToSalePct).toBe(10.0);
    expect(derived23.roas).toBe(0.3);

    // Verify 9/24 zero-sales condition
    const botox24 = records.find(
      (r) => r.treatmentId === "t_botox" && r.displayDate === "9/24"
    );
    expect(botox24).toBeDefined();
    expect(botox24.sales).toBe(0);
    const derived24 = calculateDerivedMetrics(botox24);
    expect(derived24.apptToSalePct).toBe(0.0);
    expect(derived24.cpl).toBe(10.0);
  });
});
