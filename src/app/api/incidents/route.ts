import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { incidentEvents, incidents } from '@/db/schema';

const incidentSchema = z.object({
  title: z.string().trim().min(4).max(120),
  service: z.string().trim().min(2).max(80),
  severity: z.enum(['SEV-1', 'SEV-2', 'SEV-3', 'SEV-4']),
  description: z.string().trim().min(10).max(500),
});

export async function GET() {
  const rows = db.select().from(incidents).orderBy(desc(incidents.createdAt)).all();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const parsed = incidentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please provide a valid title, service, severity and description.' },
      { status: 400 }
    );
  }

  const latest = db
    .select({ number: incidents.number })
    .from(incidents)
    .orderBy(desc(incidents.number))
    .limit(1)
    .get();
  const id = randomUUID();
  const createdAt = new Date();
  const incident = {
    id,
    number: (latest?.number ?? 100) + 1,
    ...parsed.data,
    status: 'Investigating',
    commander: 'You',
    createdAt,
    updatedAt: createdAt,
  };

  db.transaction((tx) => {
    tx.insert(incidents).values(incident).run();
    tx.insert(incidentEvents)
      .values({
        id: randomUUID(),
        incidentId: id,
        kind: 'status',
        message: `Incident declared as ${parsed.data.severity}`,
        actor: 'You',
        createdAt,
      })
      .run();
  });

  return NextResponse.json(incident, { status: 201 });
}

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['Investigating', 'Identified', 'Monitoring', 'Resolved']).optional(),
  severity: z.enum(['SEV-1', 'SEV-2', 'SEV-3', 'SEV-4']).optional(),
});

export async function PATCH(request: Request) {
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success || (!parsed.data.status && !parsed.data.severity)) {
    return NextResponse.json({ error: 'A valid status or severity is required.' }, { status: 400 });
  }

  const existing = db.select().from(incidents).where(eq(incidents.id, parsed.data.id)).get();
  if (!existing) return NextResponse.json({ error: 'Incident not found.' }, { status: 404 });

  const updatedAt = new Date();
  const changes = {
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.severity ? { severity: parsed.data.severity } : {}),
    updatedAt,
  };
  const message = parsed.data.status
    ? `Status updated to ${parsed.data.status}`
    : `Severity changed to ${parsed.data.severity}`;

  db.transaction((tx) => {
    tx.update(incidents).set(changes).where(eq(incidents.id, parsed.data.id)).run();
    tx.insert(incidentEvents)
      .values({
        id: randomUUID(),
        incidentId: parsed.data.id,
        kind: parsed.data.status ? 'status' : 'severity',
        message,
        actor: 'You',
        createdAt: updatedAt,
      })
      .run();
  });

  return NextResponse.json({ ...existing, ...changes });
}
