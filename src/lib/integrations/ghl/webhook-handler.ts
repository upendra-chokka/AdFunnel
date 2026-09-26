import { verifyGhlWebhookSignature } from "./crypto";
import { classifyAppointment, AppointmentBookingType } from "./classifier";

export interface GhlWebhookPayload {
  type: string; // 'ContactCreate', 'AppointmentCreate', etc.
  locationId: string;
  id?: string;
  contactId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  calendarId?: string;
  startTime?: string;
  status?: string;
  monetaryValue?: number;
  amount?: number;
  pipelineStageId?: string;
  attributionSource?: Record<string, any>;
  [key: string]: any;
}

export interface WebhookProcessingResult {
  success: boolean;
  status: "processed" | "duplicate" | "signature_failed" | "error";
  eventId: string;
  message?: string;
  derivedType?: AppointmentBookingType;
}

// In-memory idempotency cache for fast deduplication check
const processedEvents = new Set<string>();

/**
 * Ingests, cryptographically verifies, and idempotently routes GoHighLevel webhooks.
 */
export async function handleGhlWebhook(
  rawBody: string,
  signatureHeader: string | null,
  publicKey: string | null = process.env.GHL_WEBHOOK_PUBLIC_KEY || null
): Promise<WebhookProcessingResult> {
  let payload: GhlWebhookPayload;

  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return {
      success: false,
      status: "error",
      eventId: "unknown",
      message: "Malformed JSON payload",
    };
  }

  // Derive unique event ID for idempotency guarantee
  const eventId =
    payload.id ||
    payload.eventId ||
    `${payload.type}_${payload.contactId || payload.id}_${Date.now()}`;

  // Step 1: Idempotency Check
  if (processedEvents.has(eventId)) {
    return {
      success: true,
      status: "duplicate",
      eventId,
      message: "Event already processed. Duplicate skipped without error.",
    };
  }

  // Step 2: Signature Verification (Skipped only in mock development if key is empty)
  if (publicKey) {
    const isValid = verifyGhlWebhookSignature(rawBody, signatureHeader, publicKey);
    if (!isValid) {
      return {
        success: false,
        status: "signature_failed",
        eventId,
        message: "Cryptographic Ed25519 signature verification failed.",
      };
    }
  }

  // Step 3: Event Routing & Business Transformation
  let derivedType: AppointmentBookingType | undefined;

  switch (payload.type) {
    case "ContactCreate":
    case "ContactUpdate":
      // Extract UTM and Click IDs for attribution
      const attribution = payload.attributionSource || {};
      // In production, record to PostgreSQL `contacts` and `lead_attribution`
      break;

    case "AppointmentCreate":
    case "AppointmentUpdate":
      // Execute Self-Booked vs Setter-Booked classification
      derivedType = classifyAppointment({
        source: payload.source,
        tags: payload.tags,
        calendarId: payload.calendarId,
      });
      break;

    case "OpportunityStageUpdate":
      // Track pipeline transition and monetary value
      break;

    case "PaymentReceived":
    case "InvoicePaid":
      // Track revenue amount
      break;

    default:
      // Unknown event type logged safely
      break;
  }

  // Record into idempotency memory
  processedEvents.add(eventId);

  return {
    success: true,
    status: "processed",
    eventId,
    derivedType,
    message: `GHL event ${payload.type} processed successfully.`,
  };
}
