import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, test } from "vitest";
import { createMcpServer } from "./mcp.js";
describe("MCP", () => { test("lists calendar tools", async () => { const [c,s] = InMemoryTransport.createLinkedPair(); const server = createMcpServer(); await server.connect(s); const client = new Client({name:"test",version:"1"}); await client.connect(c); const tools = await client.listTools(); expect(tools.tools.map(x=>x.name).sort()).toEqual(["create_event","list_events","move_event"]); await client.close(); await server.close(); }); });
