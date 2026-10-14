export { VERSION } from "./version.js";
export { CalendarVendorError, GoogleCalendarAdapter, CalComAdapter, adapterFor, validateEvent } from "./calendar.js";
export type { Vendor, CalendarEvent, CalendarAdapter } from "./calendar.js";
import { defineBrand, type BrandConfig } from "./core.js";
import { VERSION } from "./version.js";
export { defineBrand, createLogger, GuardError, VendorError, createGuards, LocalRouterAdapter, HttpRouterAdapter, recordCost, getCostReport, resetCosts, createDryRunResult, dispatchText, summarizeText } from "./core.js";
export type { BrandConfig } from "./core.js";
export const DEFAULT_BRAND: BrandConfig = defineBrand({ name: "Agentic Calendar", command: "agentic-calendar", description: "List, create, and move events on Google Calendar and Cal.com.", keywords: ["calendar", "google-calendar", "cal.com", "cli", "mcp"], version: VERSION });
