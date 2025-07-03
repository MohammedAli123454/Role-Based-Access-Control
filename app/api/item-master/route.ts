import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/drizzle';
import { items } from '@/config/schema';
import { getUserFromRequest } from '@/lib/auth';

// GET: List all items
export async function GET() {
  const data = await db.select().from(items);
  return NextResponse.json(data);
}

// POST: Add a new item (admin or superuser only)
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== 'admin' && user.role !== 'superuser')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { name, sku, quantity } = await req.json();
  const result = await db
    .insert(items)
    .values({ name, sku, quantity })
    .returning();
  return NextResponse.json(result[0]);
}

// PUT: Edit an item (admin or superuser only)
export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== 'admin' && user.role !== 'superuser')) {
    return NextResponse.json(
      { error: 'Only admin or superuser can edit records.' },
      { status: 403 }
    );
  }
  const { id, name, sku, quantity } = await req.json();
  const result = await db
    .update(items)
    .set({ name, sku, quantity })
    .where(eq(items.id, id))
    .returning();
  return NextResponse.json(result[0]);
}

// DELETE: Delete an item (admin only)
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only admin can delete records.' },
      { status: 403 }
    );
  }
  const { id } = await req.json();
  await db.delete(items).where(eq(items.id, id));
  return NextResponse.json({ success: true });
}
