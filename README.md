# Agentic Calendar

Agentic Calendar lists, creates, and moves events on Google Calendar and Cal.com.
It has a CLI and MCP tools for calendar agents.

Dry run is the default. Add `--live` to call a vendor.

## Vendors

| Brand | Environment key | Live command |
| --- | --- | --- |
| Google Calendar | `GOOGLE_CALENDAR_ACCESS_TOKEN` | `npx agentic-calendar list --vendor google --live` |
| Cal.com | `CALCOM_API_KEY` | `npx agentic-calendar list --vendor calcom --live` |

## Install

```sh
npm install agentic-calendar
```

## Quick start

This is a dry run. It does not call Google Calendar or Cal.com.

```sh
npx agentic-calendar create --vendor google --title "Planning" \
  --start "2026-01-01T10:00:00Z" --end "2026-01-01T11:00:00Z"
```

## Three uses

### List events

```sh
npx agentic-calendar list --vendor calcom
```

### Create an event

```js
import { GoogleCalendarAdapter } from "agentic-calendar";

await new GoogleCalendarAdapter().create({
  title: "Planning",
  start: "2026-01-01T10:00:00Z",
  end: "2026-01-01T11:00:00Z",
});
```

Set `GOOGLE_CALENDAR_ACCESS_TOKEN` before making a live Google call.
Set `CALCOM_API_KEY` before making a live Cal.com call.

### Let an agent use MCP

```sh
npx agentic-calendar mcp
```

Call `list_events`, `create_event`, or `move_event`. Each tool defaults to
a dry run. Pass `live: true` for a vendor call.

## License

MIT.
