import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dealerRequests = sqliteTable("dealer_requests", {
  id: text("id").primaryKey(),
  dealer: text("dealer").notNull(),
  email: text("email").notNull(),
  school: text("school").notNull(),
  district: text("district").notNull(),
  product: text("product").notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  submittedAt: integer("submitted_at").notNull(),
  status: text("status").notNull().default("Pending"),
  decidedAt: integer("decided_at"),
  decidedBy: text("decided_by"),
});
