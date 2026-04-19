import { promises as fs } from "fs";
import path from "path";
import postgres from "postgres";
import { createSeedStore } from "@/lib/seed";
import { nowIso } from "@/lib/helpers";
import { AppStore } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const WORKSPACE_STATE_ID = "hireflow-main";
const sql = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, {
      ssl: "require",
      max: 1,
    })
  : null;

async function ensureDatabaseState() {
  if (!sql) return;

  await sql`
    create table if not exists workspace_state (
      id text primary key,
      state jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `;

  const existing = await sql<{ state: AppStore }[]>`
    select state
    from workspace_state
    where id = ${WORKSPACE_STATE_ID}
    limit 1
  `;

  if (!existing.length) {
    const seedStore = createSeedStore();
    await sql`
      insert into workspace_state (id, state)
      values (${WORKSPACE_STATE_ID}, ${sql.json(JSON.parse(JSON.stringify(seedStore)))})
    `;
  }
}

async function tryDatabaseRead() {
  if (!sql) return null;

  try {
    await ensureDatabaseState();
    const rows = await sql<{ state: AppStore }[]>`
      select state
      from workspace_state
      where id = ${WORKSPACE_STATE_ID}
      limit 1
    `;
    return rows[0]?.state ?? null;
  } catch {
    return null;
  }
}

async function ensureStoreFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(STORE_PATH);
  } catch {
    const seedStore = createSeedStore();
    await fs.writeFile(STORE_PATH, JSON.stringify(seedStore, null, 2), "utf-8");
  }
}

export async function getStore() {
  const databaseState = await tryDatabaseRead();
  if (databaseState) {
    return databaseState;
  }

  await ensureStoreFile();
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  return JSON.parse(raw) as AppStore;
}

export async function saveStore(store: AppStore) {
  if (sql) {
    const nextStore = {
      ...store,
      meta: {
        ...store.meta,
        updatedAt: nowIso(),
      },
    };

    try {
      await ensureDatabaseState();
      await sql`
        update workspace_state
        set state = ${sql.json(JSON.parse(JSON.stringify(nextStore)))},
            updated_at = now()
        where id = ${WORKSPACE_STATE_ID}
      `;
      return nextStore;
    } catch {
      // fall through to local persistence if the database is temporarily unavailable
    }
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const nextStore = {
    ...store,
    meta: {
      ...store.meta,
      updatedAt: nowIso(),
    },
  };
  const tempPath = `${STORE_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(nextStore, null, 2), "utf-8");
  await fs.rename(tempPath, STORE_PATH);
  return nextStore;
}

export async function updateStore(mutator: (store: AppStore) => Promise<AppStore> | AppStore) {
  const current = await getStore();
  const next = await mutator(structuredClone(current));
  return saveStore(next);
}
