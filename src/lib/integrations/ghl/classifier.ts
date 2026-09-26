export type AppointmentBookingType = "self_booked" | "setter_booked";

export interface AppointmentClassificationInput {
  source?: string;
  tags?: string[];
  calendarId?: string;
  assignedUserId?: string;
  customFields?: Record<string, any>;
}

export interface ClassificationRuleConfig {
  selfBookedSources?: string[];
  setterBookedSources?: string[];
  selfBookedTags?: string[];
  setterBookedTags?: string[];
  setterCalendarIds?: string[];
}

const DEFAULT_CONFIG: ClassificationRuleConfig = {
  selfBookedSources: ["widget", "booking_widget", "online", "direct_calendar", "website_form"],
  setterBookedSources: ["setter", "outbound", "manual", "call_center", "phone"],
  selfBookedTags: ["self-booked", "self_booked", "online-booking"],
  setterBookedTags: ["setter-booked", "setter_booked", "phone-scheduled", "qualified-by-setter"],
  setterCalendarIds: ["cal_setter_team_01", "cal_outbound_schedulers"],
};

/**
 * Deterministically classifies an appointment as Self-Booked vs Setter-Booked.
 * Resolves priority:
 * 1. Explicit tags on contact or appointment
 * 2. Source / Widget identifier
 * 3. Calendar assignment
 * 4. Default: Self-Booked
 */
export function classifyAppointment(
  input: AppointmentClassificationInput,
  config: ClassificationRuleConfig = DEFAULT_CONFIG
): AppointmentBookingType {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const tags = (input.tags || []).map((t) => t.toLowerCase().trim());
  const source = (input.source || "").toLowerCase().trim();

  // Tier 1: Check Tags
  if (tags.some((tag) => mergedConfig.setterBookedTags?.includes(tag))) {
    return "setter_booked";
  }
  if (tags.some((tag) => mergedConfig.selfBookedTags?.includes(tag))) {
    return "self_booked";
  }

  // Tier 2: Check Booking Source
  if (mergedConfig.setterBookedSources?.some((s) => source.includes(s))) {
    return "setter_booked";
  }
  if (mergedConfig.selfBookedSources?.some((s) => source.includes(s))) {
    return "self_booked";
  }

  // Tier 3: Check Dedicated Setter Calendars
  if (input.calendarId && mergedConfig.setterCalendarIds?.includes(input.calendarId)) {
    return "setter_booked";
  }

  // Tier 4: Custom Field inspection
  if (input.customFields?.booking_type === "setter") {
    return "setter_booked";
  }

  // Default fallback
  return "self_booked";
}
