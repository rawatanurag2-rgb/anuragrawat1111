import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { appState } from "../../db/schema.js";

// The dashboard persists a handful of named buckets (orders, expenses, menu,
// settings, orderCounter, menuSeeded). Only these keys may be read or written
// through this endpoint.
const ALLOWED_KEYS = new Set(["orders", "expenses", "menu", "settings", "orderCounter", "menuSeeded"]);

export default async (req: Request) => {
  if (req.method === "GET") {
    const key = new URL(req.url).searchParams.get("key");
    if (!key || !ALLOWED_KEYS.has(key)) {
      return Response.json({ error: "Invalid key" }, { status: 400 });
    }
    const [row] = await db.select().from(appState).where(eq(appState.key, key));
    return Response.json(row ? { key: row.key, value: row.value } : null);
  }

  if (req.method === "PUT") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { key, value } = body ?? {};
    if (!key || !ALLOWED_KEYS.has(key) || typeof value !== "string") {
      return Response.json({ error: "Invalid key or value" }, { status: 400 });
    }
    await db
      .insert(appState)
      .values({ key, value })
      .onConflictDoUpdate({ target: appState.key, set: { value, updatedAt: new Date() } });
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/state",
};
