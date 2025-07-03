import { db } from "@/config/drizzle";
import { users } from "@/config/schema";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { username, password, role } = await req.json();
  if (!username || !password || !role) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  // Check for existing username using Drizzle's eq function
  const exists = await db.select().from(users)
    .where(eq(users.username, username))
    .then(r => r.length > 0);
  if (exists) {
    return NextResponse.json({ error: "User exists" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ username, password: hash, role });
  return NextResponse.json({ success: true });
}
