export type Vendor = "google" | "calcom";

export interface CalendarEvent {
  id: string;
  vendor: Vendor;
  calendarId?: string;
  title: string;
  start: string;
  end: string;
  timezone?: string;
  description?: string;
  attendees?: string[];
  url?: string;
}

export interface CalendarAdapter {
  readonly vendor: Vendor;
  list(input: { calendarId?: string; start?: string; end?: string }): Promise<CalendarEvent[]>;
  create(input: Omit<CalendarEvent, "id" | "vendor" | "url">): Promise<CalendarEvent>;
  move(input: { id: string; start: string; end: string; calendarId?: string }): Promise<CalendarEvent>;
}

export class CalendarVendorError extends Error {
  constructor(message: string, readonly status?: number, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = "CalendarVendorError";
  }
}

function requireKey(vendor: Vendor, key: string | undefined): string {
  if (!key) throw new CalendarVendorError(`${vendor} credentials are missing; set the required vendor key before using --live`);
  return key;
}

function iso(value: string, label: string): void {
  if (Number.isNaN(Date.parse(value))) throw new Error(`${label} must be an ISO date-time`);
}

export class GoogleCalendarAdapter implements CalendarAdapter {
  readonly vendor = "google" as const;
  constructor(private readonly accessToken = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN, private readonly fetchFn: typeof fetch = fetch) {}
  private headers(): HeadersInit { return { authorization: `Bearer ${requireKey(this.vendor, this.accessToken)}`, "content-type": "application/json" }; }
  async list(input: { calendarId?: string; start?: string; end?: string }): Promise<CalendarEvent[]> {
    const calendarId = encodeURIComponent(input.calendarId ?? "primary");
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`);
    if (input.start) url.searchParams.set("timeMin", input.start); if (input.end) url.searchParams.set("timeMax", input.end);
    const response = await this.request(url.toString()); const body = await response.json() as { items?: any[] };
    return (body.items ?? []).map((event) => this.fromGoogle(event));
  }
  async create(input: Omit<CalendarEvent, "id" | "vendor" | "url">): Promise<CalendarEvent> {
    const calendarId = encodeURIComponent(input.calendarId ?? "primary");
    const response = await this.request(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, "POST", this.toGoogle(input));
    return this.fromGoogle(await response.json());
  }
  async move(input: { id: string; start: string; end: string; calendarId?: string }): Promise<CalendarEvent> {
    const calendarId = encodeURIComponent(input.calendarId ?? "primary");
    const response = await this.request(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(input.id)}`, "PATCH", { start: { dateTime: input.start }, end: { dateTime: input.end } });
    return this.fromGoogle(await response.json());
  }
  private async request(url: string, method = "GET", body?: unknown): Promise<Response> {
    let response: Response; try { response = await this.fetchFn(url, { method, headers: this.headers(), body: body === undefined ? undefined : JSON.stringify(body) }); } catch (error) { throw new CalendarVendorError(`google request failed: ${String(error)}`, undefined, { cause: error }); }
    if (!response.ok) throw new CalendarVendorError(`google returned ${response.status}: ${await response.text()}`, response.status); return response;
  }
  private toGoogle(event: Omit<CalendarEvent, "id" | "vendor" | "url">) { return { summary: event.title, description: event.description, start: { dateTime: event.start, timeZone: event.timezone }, end: { dateTime: event.end, timeZone: event.timezone }, attendees: event.attendees?.map((email) => ({ email })) }; }
  private fromGoogle(event: any): CalendarEvent { return { id: event.id, vendor: "google", title: event.summary ?? "", start: event.start?.dateTime ?? event.start?.date, end: event.end?.dateTime ?? event.end?.date, description: event.description, attendees: event.attendees?.map((a: any) => a.email).filter(Boolean), url: event.htmlLink }; }
}

export class CalComAdapter implements CalendarAdapter {
  readonly vendor = "calcom" as const;
  constructor(private readonly apiKey = process.env.CALCOM_API_KEY, private readonly baseUrl = "https://api.cal.com/v2", private readonly fetchFn: typeof fetch = fetch) {}
  private headers(): HeadersInit { return { authorization: `Bearer ${requireKey(this.vendor, this.apiKey)}`, "content-type": "application/json" }; }
  async list(input: { calendarId?: string; start?: string; end?: string }): Promise<CalendarEvent[]> {
    const url = new URL(`${this.baseUrl}/bookings`); if (input.start) url.searchParams.set("afterStart", input.start); if (input.end) url.searchParams.set("beforeEnd", input.end);
    const body = await (await this.request(url.toString())).json() as { data?: any[] }; return (body.data ?? []).map((event) => this.fromCal(event));
  }
  async create(input: Omit<CalendarEvent, "id" | "vendor" | "url">): Promise<CalendarEvent> {
    const body = await (await this.request(`${this.baseUrl}/bookings`, "POST", { title: input.title, start: input.start, end: input.end, description: input.description, attendees: input.attendees })).json(); return this.fromCal(body.data ?? body);
  }
  async move(input: { id: string; start: string; end: string; calendarId?: string }): Promise<CalendarEvent> {
    const body = await (await this.request(`${this.baseUrl}/bookings/${encodeURIComponent(input.id)}/reschedule`, "POST", { start: input.start, end: input.end })).json(); return this.fromCal(body.data ?? body);
  }
  private async request(url: string, method = "GET", body?: unknown): Promise<Response> { let response: Response; try { response = await this.fetchFn(url, { method, headers: this.headers(), body: body === undefined ? undefined : JSON.stringify(body) }); } catch (error) { throw new CalendarVendorError(`calcom request failed: ${String(error)}`, undefined, { cause: error }); } if (!response.ok) throw new CalendarVendorError(`calcom returned ${response.status}: ${await response.text()}`, response.status); return response; }
  private fromCal(event: any): CalendarEvent { return { id: String(event.id ?? event.uid), vendor: "calcom", title: event.title ?? event.eventType?.title ?? "", start: event.startTime ?? event.start, end: event.endTime ?? event.end, description: event.description, attendees: event.attendees?.map((a: any) => typeof a === "string" ? a : a.email).filter(Boolean), url: event.metadata?.videoCallUrl ?? event.meetingUrl }; }
}

export function validateEvent(input: { title: string; start: string; end: string }): void { if (!input.title.trim()) throw new Error("title is required"); iso(input.start, "start"); iso(input.end, "end"); if (Date.parse(input.end) <= Date.parse(input.start)) throw new Error("end must be after start"); }
export function adapterFor(vendor: Vendor): CalendarAdapter { return vendor === "google" ? new GoogleCalendarAdapter() : new CalComAdapter(); }
