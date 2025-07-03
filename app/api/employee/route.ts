import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/drizzle';
import { employees } from '@/config/schema';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
  const data = await db.select().from(employees);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== 'admin' && user.role !== 'superuser')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, date_of_joining, status, dob, country, state, city } =
    body;

  const result = await db
    .insert(employees)
    .values({ name, email, date_of_joining, status, dob, country, state, city })
    .returning();

  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== 'admin' && user.role !== 'superuser')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const {
    id,
    name,
    email,
    date_of_joining,
    status,
    dob,
    country,
    state,
    city,
  } = body;

  await db
    .update(employees)
    .set({ name, email, date_of_joining, status, dob, country, state, city })
    .where(eq(employees.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await req.json();
  await db.delete(employees).where(eq(employees.id, id));
  return NextResponse.json({ success: true });
}
