import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import {
  SERVICES,
  SERVICE_BY_ID,
  SERVICE_IDS,
  getService,
} from './data/services.js';

import { routeIntent } from './utils/intentRouter.js';
import {
  addContact,
  addCallLog,
  getContacts,
  getCallLogs,
} from './storage.js';

/**
 * Public dispatch map.
 * wsBridge.js uses this to call tools by name without touching SDK internals.
 */
export const toolHandlers = new Map();

/**
 * Register a tool with the MCP server AND track it in toolHandlers.
 * @param {McpServer} server
 * @param {string} name
 * @param {object} config  { description, inputSchema }
 * @param {Function} handler
 */
const register = (server, name, config, handler) => {
  toolHandlers.set(name, { config, handler });
  server.registerTool(name, config, handler);
};

/** Build a standard text reply. */
const textReply = (text) => ({
  content: [{ type: 'text', text }],
});

/** Build a standard error reply. */
const errorReply = (text) => ({
  content: [{ type: 'text', text }],
  isError: true,
});

/** Build a service detail string (rich format). */
const formatService = (svc) => {
  const lines = [
    `${svc.icon}  ${svc.name} — ${svc.tagline}`,
    '',
    svc.description,
  ];
  if (Array.isArray(svc.bullets) && svc.bullets.length) {
    lines.push('', 'Includes:');
    for (const b of svc.bullets) lines.push(`• ${b}`);
  }
  return lines.join('\n');
};

// ─────────────────────────────────────────────────────────────
// MCP server factory
// ─────────────────────────────────────────────────────────────
export function createMcpServer() {
  const server = new McpServer({
    name: 'financeledgertips-voice',
    version: '1.0.0',
  });

  // ── Tool 1: service info ──
  register(
    server,
    'get_service_info',
    {
      description: 'Get details about a Finance Ledger Tips service',
      inputSchema: { serviceId: z.enum(SERVICE_IDS) },
    },
    async ({ serviceId }) => {
      const svc = getService(serviceId);
      if (!svc) return errorReply('Unknown service.');
      return textReply(formatService(svc));
    }
  );

  // ── Tool 2: route transcript ──
  register(
    server,
    'route_transcript',
    {
      description: 'Route a user transcript to a Finance Ledger Tips response',
      inputSchema: { transcript: z.string().min(1) },
    },
    async ({ transcript }) => {
      const result = routeIntent(transcript);
      return {
        content: [{ type: 'text', text: result.text }],
        structuredContent: {
          intent: result.intent,
          service: result.service ?? null,
        },
      };
    }
  );

  // ── Tool 3: list services ──
  register(
    server,
    'list_services',
    {
      description: 'List all Finance Ledger Tips services',
      inputSchema: {},
    },
    async () => {
      const text = SERVICES
        .map((s) => `${s.icon} ${s.name} — ${s.tagline}`)
        .join('\n');
      return textReply(text);
    }
  );

  // ── Tool 4: save contact ──
  register(
    server,
    'save_contact',
    {
      description: 'Save a caller as a contact for follow-up',
      inputSchema: {
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        service: z.enum(SERVICE_IDS).optional(),
        notes: z.string().optional(),
      },
    },
    async (args) => {
      await addContact(args);
      return textReply(`Saved contact: ${args.name}`);
    }
  );

  // ── Tool 5: save call log ──
  register(
    server,
    'save_call_log',
    {
      description: 'Save a complete call transcript and outcome',
      inputSchema: {
        messages: z.array(
          z.object({
            role: z.enum(['user', 'agent']),
            text: z.string(),
            ts: z.number().optional(),
          })
        ),
        outcome: z.string().optional(),
      },
    },
    async ({ messages, outcome }) => {
      await addCallLog({
        messages,
        outcome: outcome ?? 'completed',
      });
      return textReply(`Call log saved (${messages.length} messages).`);
    }
  );

  // ── Tool 6: list contacts ──
  register(
    server,
    'list_contacts',
    { description: 'List all saved contacts', inputSchema: {} },
    async () => {
      const contacts = await getContacts();
      if (!contacts.length) return textReply('No contacts yet.');

      const text = contacts
        .map((c) => {
          const email = c.email ? ` <${c.email}>` : '';
          const service = c.service ? ` — ${c.service}` : '';
          return `${c.name}${email}${service}`;
        })
        .join('\n');

      return textReply(text);
    }
  );

  // ── Tool 7: list call logs ──
  register(
    server,
    'list_call_logs',
    { description: 'List recent call logs', inputSchema: {} },
    async () => {
      const logs = await getCallLogs();
      if (!logs.length) return textReply('No call logs yet.');

      const latest = logs[logs.length - 1];
      const text =
        `${logs.length} call(s) on record.\n` +
        `Latest: ${latest.createdAt} (${latest.outcome ?? 'completed'})`;
      return textReply(text);
    }
  );

  // ── Tool 8: full service details (bullets) ──
  register(
    server,
    'get_service_details',
    {
      description: 'Get a service including feature bullets',
      inputSchema: { serviceId: z.enum(SERVICE_IDS) },
    },
    async ({ serviceId }) => {
      const svc = getService(serviceId);
      if (!svc) return errorReply('Unknown service.');
      return textReply(formatService(svc));
    }
  );

  return server;
}