import {integer, sqliteTable, text, index} from "drizzle-orm/sqlite-core";

export const visits = sqliteTable("visits", {
  eventId: text("event_id").primaryKey(),
  ip: text("ip").notNull(),
  day: text("day").notNull(),
  visitedAt: integer("visited_at").notNull(),
  view: text("view").notNull(),
  counted: integer("counted").notNull().default(0),
}, table => [index("visits_time_idx").on(table.visitedAt), index("visits_day_ip_idx").on(table.day, table.ip)]);

export const challenges = sqliteTable("collect_challenges", {
  token: text("token").primaryKey(),
  ip: text("ip").notNull(),
  origin: text("origin").notNull(),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
  usedEvent: text("used_event"),
}, table => [index("challenges_ip_time_idx").on(table.ip, table.createdAt), index("challenges_expiry_idx").on(table.expiresAt)]);

export const counter = sqliteTable("analytics_counter", {
  id: text("id").primaryKey(),
  total: integer("total").notNull(),
  startedAt: integer("started_at").notNull(),
});
export const daily = sqliteTable("daily_metrics", {
  day: text("day").primaryKey(),
  pageviews: integer("pageviews").notNull(),
});
