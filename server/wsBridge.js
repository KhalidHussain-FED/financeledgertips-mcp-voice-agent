import { WebSocketServer } from 'ws';
import { createMcpServer, toolHandlers } from './mcpServer.js';

export function startWsBridge({ port = 8765, host = '0.0.0.0' } = {}) {
  createMcpServer(); // populates toolHandlers

  const wss = new WebSocketServer({ port, host });

  wss.on('connection', (ws, req) => {
    console.error(`[WS] client connected from ${req.socket.remoteAddress}`);

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return ws.send(JSON.stringify({ error: 'invalid json' }));
      }

      const { id, method, params } = msg;

      try {
        if (method === 'listTools') {
          const tools = [...toolHandlers.entries()].map(([name, t]) => ({
            name,
            description: t.config.description,
          }));
          return ws.send(JSON.stringify({ id, result: { tools } }));
        }

        if (method === 'callTool') {
          const entry = toolHandlers.get(params?.name);
          if (!entry) {
            return ws.send(
              JSON.stringify({ id, error: `tool not found: ${params?.name}` })
            );
          }
          const result = await entry.handler(params.arguments ?? {});
          return ws.send(JSON.stringify({ id, result }));
        }

        ws.send(JSON.stringify({ id, error: `unknown method: ${method}` }));
      } catch (err) {
        console.error('[WS] handler error:', err);
        ws.send(JSON.stringify({ id, error: err.message }));
      }
    });

    ws.on('close', () => console.error('[WS] client disconnected'));
    ws.on('error', (err) => console.error('[WS] error:', err.message));
  });

  console.error(`[WS] Finance Ledger Tips MCP bridge on ws://${host}:${port}`);
  return wss;
}