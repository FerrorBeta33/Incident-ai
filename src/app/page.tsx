import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { incidents } from '@/db/schema';
import Dashboard from './dashboard';

export default function Home() {
  const incidentRows = db.select().from(incidents).orderBy(desc(incidents.createdAt)).all();
  return (
    <Dashboard
      initialIncidents={incidentRows.map((incident) => ({
        ...incident,
        createdAt: incident.createdAt.toISOString(),
        updatedAt: incident.updatedAt.toISOString(),
      }))}
    />
  );
}
