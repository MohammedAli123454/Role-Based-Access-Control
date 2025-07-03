import { pgTable, serial, varchar, timestamp, integer, date} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull(), // admin/superuser/user
  created_at: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 128 }).unique(),
  date_of_joining: date("date_of_joining"),
  status: varchar("status", { length: 24 }),
  dob: date("dob"),
  country: varchar("country", { length: 64 }),
  state: varchar("state", { length: 64 }),
  city: varchar("city", { length: 64 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  sku: varchar("sku", { length: 64 }),
  quantity: integer("quantity").default(0),
  created_at: timestamp("created_at").defaultNow(),
});
