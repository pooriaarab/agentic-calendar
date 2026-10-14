import { describe, expect, test } from "vitest";
import { CalComAdapter, GoogleCalendarAdapter } from "./calendar.js";

function fakeFetch(response: object) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetch = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(response), { status: 200, headers: { "content-type": "application/json" } });
  };
  return { calls, fetch: fetch as typeof globalThis.fetch };
}

describe("calendar live adapters", () => {
  test("Google Calendar calls its real HTTPS host", async () => {
    const fake = fakeFetch({ items: [] });
    await new GoogleCalendarAdapter("test-token", fake.fetch).list({});
    expect(fake.calls[0].url).toMatch(/^https:\/\/www\.googleapis\.com\/calendar\/v3\//);
  });

  test("Cal.com calls its real HTTPS host", async () => {
    const fake = fakeFetch({ data: [] });
    await new CalComAdapter("test-key", undefined, fake.fetch).list({});
    expect(fake.calls[0].url).toMatch(/^https:\/\/api\.cal\.com\/v2\/bookings/);
  });
});
