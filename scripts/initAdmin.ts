import { db } from "@/config/drizzle";
import { users } from "@/config/schema";
import bcrypt from "bcryptjs";

async function main() {
  const result = await db.select().from(users);
  if (result.length === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Admin user created: admin / admin123");
  } else {
    console.log("User table is not empty.");
  }
}
main();
