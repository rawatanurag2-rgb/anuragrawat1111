import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// One shared row per data bucket (orders, expenses, menu, settings, orderCounter,
// menuSeeded). This backs the dashboard's autosave so every visitor to the site
// link reads and writes the same server-side data instead of their own browser's
// local storage.
export const appState = pgTable("app_state", {
  key: text().primaryKey(),
  value: text().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
