import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './mcpServer.js';
import { startWsBridge } from './wsBridge.js';

const args = process.argv.slice(2);
const runWs = args.includes('--ws') || args.length === 0;
const runMcp = args.includes('--mcp') || args.length === 0;

const PORT = Number(process.env.PORT || process.env.WS_PORT || 8765);
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  if (runWs) startWsBridge({ port: PORT, host: HOST });

  if (runMcp) {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[MCP] Finance Ledger Tips server running on stdio');
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});