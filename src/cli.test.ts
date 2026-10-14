import { describe, expect, test } from "vitest";
import { parseArgs, runCli } from "./cli.js";
describe("CLI", () => { test("dry run is the default", async () => { const lines: string[] = []; expect(await runCli(["create", "--vendor", "google", "--title", "Planning", "--start", "2026-01-01T10:00:00Z", "--end", "2026-01-01T11:00:00Z"], { out: x => lines.push(x), err: () => {} })).toBe(0); expect(JSON.parse(lines[0])).toMatchObject({ dryRun: true, action: "create" }); }); test("vendor is required", () => expect(() => parseArgs(["list"])).toThrow("--vendor")); });
