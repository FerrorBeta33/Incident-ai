import { asc, eq } from 'drizzle-orm';
import { CheckCircle2, CircleAlert, Radio } from 'lucide-react';
import { db } from '@/db';
import { publicStatusUpdates } from '@/db/schema';

export default function PublicStatusPage() {
  const updates = db
    .select()
    .from(publicStatusUpdates)
    .where(eq(publicStatusUpdates.published, true))
    .orderBy(asc(publicStatusUpdates.createdAt))
    .all();
  const operational = updates.every((update) => update.status === 'Resolved');
  return (
    <main className="min-h-screen bg-[#0b0e12] px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-[#b6f0d6] text-[#15221d]">
              <Radio size={17} />
            </div>
            <span className="text-sm font-semibold">IncidentOps</span>
          </div>
          <span className="text-xs text-slate-600">Public status</span>
        </header>
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-sm text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-300" />
            {operational ? 'All systems operational' : 'Some systems are experiencing issues'}
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">System status</h1>
          <p className="mt-2 text-sm text-slate-500">
            Live updates from the IncidentOps response team.
          </p>
        </section>
        <section className="mb-10 grid gap-3 sm:grid-cols-2">
          <ComponentStatus name="Public API" status="Operational" />
          <ComponentStatus name="Checkout" status="Operational" />
          <ComponentStatus
            name="Search"
            status={
              updates.some((update) => update.component === 'Search') ? 'Monitoring' : 'Operational'
            }
          />
          <ComponentStatus name="Dashboard" status="Operational" />
        </section>
        <section className="rounded-lg border border-white/[0.08] bg-[#10141a] p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Incident history</h2>
            <span className="text-xs text-slate-600">Last 90 days</span>
          </div>
          {updates.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No incidents reported.</p>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => (
                <article key={update.id} className="border-l border-white/[0.12] pl-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-yellow-300" />
                    <h3 className="text-sm font-medium text-slate-200">{update.title}</h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">{update.body}</p>
                  <p className="mt-2 text-[11px] text-slate-600">
                    {update.component} · {update.status}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
        <p className="mt-8 text-center text-xs text-slate-700">
          IncidentOps status updates are curated by the response team.
        </p>
      </div>
    </main>
  );
}

function ComponentStatus({ name, status }: { name: string; status: string }) {
  const healthy = status === 'Operational';
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#10141a] px-4 py-4">
      <div className="flex items-center gap-3">
        <span
          className={`grid size-7 place-items-center rounded-md ${healthy ? 'bg-emerald-400/10 text-emerald-300' : 'bg-yellow-300/10 text-yellow-200'}`}
        >
          {healthy ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
        </span>
        <span className="text-sm text-slate-300">{name}</span>
      </div>
      <span className={`text-xs ${healthy ? 'text-emerald-300' : 'text-yellow-200'}`}>
        {status}
      </span>
    </div>
  );
}
