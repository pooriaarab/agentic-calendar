# agentic-calendar

[![npm version](https://img.shields.io/npm/v/agentic-calendar)](https://www.npmjs.com/package/agentic-calendar)
[![Downloads/month](https://img.shields.io/npm/dm/agentic-calendar)](https://www.npmjs.com/package/agentic-calendar)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/license/mit)

[Package](https://www.npmjs.com/package/agentic-calendar) · [Quickstart](#preview-your-first-event) · [Source](https://github.com/pooriaarab/agentic-calendar)

agentic-calendar is an open-source Node.js calendar adapter package with Google Calendar requests, a Cal.com scaffold, and command-line and agent tools.

## Install

```sh
npm install agentic-calendar
```

Node.js 18 or later is required. TypeScript declarations are included; there are three direct runtime dependencies.

## Preview your first event

Run this without credentials. The CLI defaults to a dry run.

```sh
npx agentic-calendar create --vendor google --title "Planning"   --start "2026-11-01T10:00:00Z" --end "2026-11-01T11:00:00Z"
```

Success prints JSON with `dryRun: true`, `action: "create"`, `vendor: "google"`, and the event input.
No event is created during this preview.

For live Google Calendar calls, export `GOOGLE_CALENDAR_ACCESS_TOKEN` and add `--live`.
For Cal.com, the scaffold reads `CALCOM_API_KEY`; live booking compatibility is incomplete.
The package does not load `.env` files. Export variables in the shell or load them in your application.

## Features and coverage

| Adapter | Status | Source behavior |
| --- | --- | --- |
| Google Calendar | Implemented; live verification pending | List events, create events, and patch event times |
| Cal.com | scaffold | Booking list, create, and reschedule requests; current API contract gaps |

Two calendar adapters exist. Tests mock HTTP responses; zero integrations were credential-checked for this rewrite.

- **SDK:** `GoogleCalendarAdapter`, `CalComAdapter`, `adapterFor`, `validateEvent`, and `CalendarVendorError`.
- **CLI:** `list`, `create`, `move`, and `mcp`; `--help` and `--version` are also available.
- **Filters:** CLI supports `--start`, `--end`, and `--calendar`; Google Calendar defaults to `primary`.
- **Event input:** CLI accepts `--description` and repeatable `--attendee`; MCP creation also accepts `timezone`.
- **Model Context Protocol (MCP):** `list_events`, `create_event`, and `move_event`; pass `live: true` for vendor requests.

Start stdio tools with `npx agentic-calendar mcp` or `npx agentic-calendar-mcp`.
SDK adapter methods make live requests directly; they do not inherit CLI dry-run defaults.

## Behavior limits

Cal.com creation omits event-type selection and the structured attendee fields in its [current booking contract](https://cal.com/docs/api-reference/v2/bookings/create-a-booking).
The adapter omits `cal-api-version` and prefers numeric booking IDs over UIDs required by the [reschedule endpoint](https://cal.com/docs/api-reference/v2/bookings/reschedule-a-booking).
Cal.com ignores `calendarId` and creation `timezone`. Treat its adapter as a scaffold.
Google responses omit `calendarId` and `timezone`; retain the calendar ID separately before moving events from non-primary calendars.
Neither adapter paginates, retries, refreshes tokens, or adds request timeouts.
The CLI does not call `validateEvent`; MCP create and move do. Validate SDK inputs explicitly.
There is no cancellation command, conflict checker, availability engine, or managed scheduling service.
Shared text routing utilities are exported separately; their guards do not protect calendar requests.
The Cloudflare Workers source exposes only health and text summary routes, with optional `PACK_NAME`; it has no calendar routes.

## Links and status

- [Google Calendar event API](https://developers.google.com/workspace/calendar/api/v3/reference/events) for token permissions and event fields.
- [Cal.com booking API](https://cal.com/docs/api-reference/v2/bookings/create-a-booking) for scaffold compatibility requirements.
- [Report a problem](https://github.com/pooriaarab/agentic-calendar/issues). Version 0.1.1 can change before 1.0.

No separate public docs site is configured. Public case studies are not published in this repository.
For contributions, run `npm ci`, `npm run build`, `npm run typecheck`, and `npm test`.

## License

MIT. See the [license text](https://opensource.org/license/mit).
