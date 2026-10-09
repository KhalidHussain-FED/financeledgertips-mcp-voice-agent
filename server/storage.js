import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORE_PATH = process.env.STORE_PATH || './data/store.json';
const DEFAULT_STORE = { contacts: [], callLogs: [] };
let writeQueue = Promise.resolve();

async function ensureStore() {
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2));
  }
}

export async function readStore() {
  await ensureStore();
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    return { ...DEFAULT_STORE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export async function writeStore(mutator) {
  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    const next = await mutator(store);
    const tmp = `${STORE_PATH}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2));
    await fs.rename(tmp, STORE_PATH);
    return next;
  });
  return writeQueue;
}

export const addContact = (c) =>
  writeStore((s) => {
    s.contacts.push({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...c,
    });
    return s;
  });

export const addCallLog = (l) =>
  writeStore((s) => {
    s.callLogs.push({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...l,
    });
    return s;
  });

export const getContacts = async () => (await readStore()).contacts;
export const getCallLogs = async () => (await readStore()).callLogs;