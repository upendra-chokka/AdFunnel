import { describe, it, expect } from "vitest";
import nacl from "tweetnacl";
import { verifyGhlWebhookSignature } from "../lib/integrations/ghl/crypto";
import { classifyAppointment } from "../lib/integrations/ghl/classifier";
import { handleGhlWebhook } from "../lib/integrations/ghl/webhook-handler";
import { runNightlyGhlReconciliation } from "../lib/integrations/ghl/reconciler";

describe("Phase 3: GoHighLevel Integration & Security", () => {
  // Test 1: Cryptographic Ed25519 Verification
  it("verifies authentic Ed25519 webhook signature and rejects forged payload", () => {
    const keyPair = nacl.sign.keyPair();
    const publicKeyHex = Buffer.from(keyPair.publicKey).toString("hex");

    const payload = JSON.stringify({
      type: "ContactCreate",
      locationId: "loc_test_123",
      contactId: "c_99",
      email: "test@medspa.com",
    });

    const messageUint8 = new TextEncoder().encode(payload);
    const signature = nacl.sign.detached(messageUint8, keyPair.secretKey);
    const signatureHex = Buffer.from(signature).toString("hex");

    // Authentic signature should pass
    const isValid = verifyGhlWebhookSignature(payload, signatureHex, publicKeyHex);
    expect(isValid).toBe(true);

    // Tampered payload should fail
    const tamperedPayload = payload + "tampered";
    const isTamperedValid = verifyGhlWebhookSignature(tamperedPayload, signatureHex, publicKeyHex);
    expect(isTamperedValid).toBe(false);

    // Corrupted signature should fail
    const corruptedSig = signatureHex.replace("a", "b");
    const isCorruptedValid = verifyGhlWebhookSignature(payload, corruptedSig, publicKeyHex);
    expect(isCorruptedValid).toBe(false);
  });

  // Test 2: Idempotent Webhook Processing
  it("processes webhook on first delivery and marks duplicate deliveries as idempotent duplicate", async () => {
    const rawPayload = JSON.stringify({
      id: "evt_ghl_unique_101",
      type: "ContactCreate",
      locationId: "loc_test_123",
      contactId: "c_101",
      source: "Facebook Lead Ad",
    });

    // 1st delivery
    const res1 = await handleGhlWebhook(rawPayload, null, null);
    expect(res1.success).toBe(true);
    expect(res1.status).toBe("processed");

    // 2nd delivery (identical event_id)
    const res2 = await handleGhlWebhook(rawPayload, null, null);
    expect(res2.success).toBe(true);
    expect(res2.status).toBe("duplicate");
  });

  // Test 3: Self-Booked vs Setter-Booked Classifier
  it("accurately classifies appointments based on source, tags, and calendars", () => {
    // Online widget -> Self-booked
    const selfAppt = classifyAppointment({
      source: "booking_widget",
      tags: [],
    });
    expect(selfAppt).toBe("self_booked");

    // Setter tag -> Setter-booked
    const setterTagAppt = classifyAppointment({
      source: "online",
      tags: ["setter-booked"],
    });
    expect(setterTagAppt).toBe("setter_booked");

    // Dedicated setter calendar -> Setter-booked
    const setterCalAppt = classifyAppointment({
      calendarId: "cal_setter_team_01",
    });
    expect(setterCalAppt).toBe("setter_booked");

    // Default unknown source fallback -> self_booked
    const fallbackAppt = classifyAppointment({});
    expect(fallbackAppt).toBe("self_booked");
  });

  // Test 4: Nightly Reconciliation Engine
  it("executes nightly reconciliation worker and produces audit report", async () => {
    const report = await runNightlyGhlReconciliation("loc_aura_nyc_01", "c0000000-0000-0000-0000-000000000001", 14);

    expect(report.status).toBe("success");
    expect(report.locationId).toBe("loc_aura_nyc_01");
    expect(report.contactsExamined).toBeGreaterThan(0);
    expect(report.appointmentsReconciled).toBeGreaterThan(0);
    expect(report.opportunitiesUpdated).toBeGreaterThan(0);
  });
});
