'use client';

import { useState } from 'react';
import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  ExternalLink,
  Filter,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
  Radio,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';

type Incident = {
  id: string;
  number: number;
  title: string;
  service: string;
  description: string;
  severity: string;
  status: string;
  commander: string;
  createdAt: string;
  updatedAt: string;
};

const severityMeta: Record<string, { label: string; tone: string; dot: string }> = {
  'SEV-1': {
    label: 'Critical',
    tone: 'border-red-400/30 bg-red-400/10 text-red-300',
    dot: 'bg-red-400',
  },
  'SEV-2': {
    label: 'High',
    tone: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
    dot: 'bg-orange-400',
  },
  'SEV-3': {
    label: 'Medium',
    tone: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-200',
    dot: 'bg-yellow-300',
  },
  'SEV-4': {
    label: 'Low',
    tone: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
    dot: 'bg-sky-300',
  },
};

const statusTone: Record<string, string> = {
  Investigating: 'text-red-300',
  Identified: 'text-orange-300',
  Monitoring: 'text-emerald-300',
  Resolved: 'text-slate-400',
};

const timeSince = (date: string) => {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

export default function Dashboard({ initialIncidents }: { initialIncidents: Incident[] }) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [selectedId, setSelectedId] = useState(initialIncidents[0]?.id ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const selected = incidents.find((incident) => incident.id === selectedId) ?? incidents[0];
  const active = incidents.filter((incident) => incident.status !== 'Resolved');
  const avgMinutes = Math.round(
    active.reduce(
      (sum, incident) => sum + (Date.now() - new Date(incident.createdAt).getTime()) / 60000,
      0
    ) / Math.max(active.length, 1)
  );

  const updateIncident = async (payload: { status?: string; severity?: string }) => {
    if (!selected) return;
    const response = await fetch('/api/incidents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, ...payload }),
    });
    if (!response.ok) return setToast('Could not update incident');
    const updated = await response.json();
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === updated.id
          ? { ...incident, ...updated, updatedAt: new Date(updated.updatedAt).toISOString() }
          : incident
      )
    );
    setToast(
      payload.status
        ? `Status updated to ${payload.status}`
        : `Severity updated to ${payload.severity}`
    );
    window.setTimeout(() => setToast(''), 2600);
  };

  return (
    <main className="min-h-screen bg-[#0b0e12] text-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={`${mobileNav ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.07] bg-[#10141a] transition-transform lg:static lg:translate-x-0`}
        >
          <div className="flex h-16 items-center gap-3 border-b border-white/[0.07] px-5">
            <div className="grid size-8 place-items-center rounded-lg bg-[#b6f0d6] text-[#15221d]">
              <Radio size={17} strokeWidth={2.7} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">IncidentOps</p>
              <p className="text-[10px] tracking-[0.2em] text-slate-500 uppercase">
                Response control
              </p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5 text-sm">
            <NavItem icon={<LayoutDashboard size={16} />} label="Command center" active />
            <NavItem icon={<Activity size={16} />} label="All incidents" />
            <NavItem icon={<Check size={16} />} label="Post-incident reviews" badge="2" />
            <div className="my-5 border-t border-white/[0.06]" />
            <p className="px-3 pb-2 text-[10px] font-medium tracking-[0.18em] text-slate-600 uppercase">
              Configure
            </p>
            <NavItem icon={<Settings2 size={16} />} label="Workflows & rules" />
            <NavItem icon={<ShieldCheck size={16} />} label="Integrations" />
            <NavItem icon={<UserRound size={16} />} label="Team access" />
          </nav>
          <div className="border-t border-white/[0.07] p-3">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-white/[0.04]">
              <div className="grid size-8 place-items-center rounded-full bg-[#435c67] text-xs font-semibold">
                MC
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">Maya Chen</p>
                <p className="text-[11px] text-slate-500">Incident Commander</p>
              </div>
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b border-white/[0.07] px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNav(!mobileNav)}
                className="rounded-md p-2 text-slate-400 hover:bg-white/[0.06] lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
                <Command size={14} /> <span>Workspace</span>
                <span>/</span>
              </div>
              <h1 className="text-sm font-semibold">Command center</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="hidden items-center gap-2 rounded-md border border-white/[0.08] px-3 py-2 text-xs text-slate-400 hover:border-white/20 sm:flex">
                <Search size={14} /> Search{' '}
                <kbd className="ml-2 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px]">⌘K</kbd>
              </button>
              <button
                className="relative rounded-md p-2 text-slate-400 hover:bg-white/[0.06]"
                aria-label="Notifications"
              >
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-orange-400" />
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-md bg-[#b6f0d6] px-3 py-2 text-xs font-semibold text-[#122019] shadow-[0_0_20px_rgba(182,240,214,0.1)] hover:bg-[#c8f7e1]"
              >
                <Plus size={15} /> <span className="hidden sm:inline">Declare incident</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-300" /> All systems operational
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Good morning, Maya
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Here&apos;s the current pulse across your response workspace.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="size-1.5 rounded-full bg-emerald-400" /> Updated just now{' '}
                <button
                  className="rounded-md border border-white/[0.08] p-1.5 hover:bg-white/[0.05]"
                  aria-label="Refresh"
                >
                  <Activity size={13} />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                label="Active incidents"
                value={String(active.length).padStart(2, '0')}
                detail="2 need attention"
                tone="text-orange-300"
                icon={<Radio size={15} />}
              />
              <Metric
                label="Avg. time to resolve"
                value={`${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`}
                detail="↓ 18% vs last month"
                tone="text-emerald-300"
                icon={<Clock3 size={15} />}
              />
              <Metric
                label="Open post-mortems"
                value="02"
                detail="1 overdue this week"
                tone="text-sky-300"
                icon={<MessageSquare size={15} />}
              />
              <Metric
                label="System health"
                value="99.98%"
                detail="Last 30 days"
                tone="text-emerald-300"
                icon={<ShieldCheck size={15} />}
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(330px,0.7fr)]">
              <section className="min-w-0">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Active incidents</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Live response queue · {active.length} currently open
                    </p>
                  </div>
                  <button className="flex items-center gap-2 rounded-md border border-white/[0.08] px-2.5 py-1.5 text-xs text-slate-400 hover:border-white/20">
                    <Filter size={13} /> Filter
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#10141a]">
                  <div className="hidden grid-cols-[1.2fr_0.6fr_0.7fr_0.7fr_0.7fr] gap-4 border-b border-white/[0.07] px-4 py-3 text-[10px] font-medium tracking-[0.15em] text-slate-600 uppercase md:grid">
                    <span>Incident</span>
                    <span>Severity</span>
                    <span>Status</span>
                    <span>Commander</span>
                    <span>Elapsed</span>
                  </div>
                  {incidents.map((incident) => (
                    <IncidentRow
                      key={incident.id}
                      incident={incident}
                      selected={selected?.id === incident.id}
                      onClick={() => setSelectedId(incident.id)}
                    />
                  ))}
                </div>
              </section>
              {selected && <IncidentPanel incident={selected} onUpdate={updateIncident} />}
            </div>
          </div>
        </section>
      </div>
      {mobileNav && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}
      {modalOpen && (
        <DeclareModal
          onClose={() => setModalOpen(false)}
          onCreated={(incident) => {
            setIncidents((current) => [incident, ...current]);
            setSelectedId(incident.id);
            setModalOpen(false);
            setToast('Incident declared successfully');
            window.setTimeout(() => setToast(''), 2600);
          }}
        />
      )}
      {toast && (
        <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-[#14221d] px-4 py-3 text-sm text-emerald-100 shadow-xl">
          <Check size={16} className="text-emerald-300" /> {toast}
        </div>
      )}
    </main>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs ${active ? 'bg-white/[0.07] text-white' : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'}`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="rounded bg-sky-400/10 px-1.5 py-0.5 text-[10px] text-sky-300">
          {badge}
        </span>
      )}
    </button>
  );
}
function Metric({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#10141a] p-4">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs">{label}</span>
        <span className={tone}>{icon}</span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <strong className="text-2xl font-semibold tracking-[-0.04em] text-white">{value}</strong>
        <span className={`text-[11px] ${tone}`}>{detail}</span>
      </div>
    </div>
  );
}
function IncidentRow({
  incident,
  selected,
  onClick,
}: {
  incident: Incident;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = severityMeta[incident.severity] ?? {
    label: 'Low',
    tone: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
    dot: 'bg-sky-300',
  };
  return (
    <button
      onClick={onClick}
      className={`grid w-full gap-3 border-b border-white/[0.06] px-4 py-4 text-left transition-colors last:border-0 md:grid-cols-[1.2fr_0.6fr_0.7fr_0.7fr_0.7fr] md:items-center md:gap-4 ${selected ? 'bg-[#16201e]' : 'hover:bg-white/[0.025]'}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${meta.dot}`} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-200">{incident.title}</p>
          <p className="mt-1 text-[11px] text-slate-600">
            #{incident.number} · {incident.service}
          </p>
        </div>
      </div>
      <span className={`w-fit rounded border px-2 py-1 text-[10px] font-medium ${meta.tone}`}>
        {incident.severity} <span className="hidden xl:inline">· {meta.label}</span>
      </span>
      <span className={`text-xs ${statusTone[incident.status]}`}>{incident.status}</span>
      <span className="text-xs text-slate-400">{incident.commander}</span>
      <span className="flex items-center gap-1 text-xs text-slate-500 tabular-nums">
        <Clock3 size={12} /> {timeSince(incident.createdAt)}
      </span>
    </button>
  );
}
function IncidentPanel({
  incident,
  onUpdate,
}: {
  incident: Incident;
  onUpdate: (payload: { status?: string; severity?: string }) => void;
}) {
  const [tab, setTab] = useState('overview');
  const statuses = ['Investigating', 'Identified', 'Monitoring', 'Resolved'];
  const current = statuses.indexOf(incident.status);
  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#10141a]">
      <div className="border-b border-white/[0.07] p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-[10px] tracking-[0.18em] text-slate-600 uppercase">
              #{incident.number} · {incident.service}
            </p>
            <h3 className="text-base font-semibold text-white">{incident.title}</h3>
          </div>
          <button
            className="rounded-md p-1.5 text-slate-500 hover:bg-white/[0.05]"
            aria-label="More incident actions"
          >
            <CircleHelp size={16} />
          </button>
        </div>
        <div className="mb-5 flex items-center gap-1">
          {statuses.map((status, index) => (
            <div key={status} className="flex flex-1 items-center gap-1">
              <button
                onClick={() => onUpdate({ status })}
                className={`h-1.5 w-full rounded-full transition-colors ${index <= current ? 'bg-[#b6f0d6]' : 'bg-white/[0.08]'}`}
                aria-label={`Set status ${status}`}
              />
              <span className="sr-only">{status}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 text-xs ${statusTone[incident.status]}`}>
            <span className="size-1.5 rounded-full bg-current" /> {incident.status}
          </span>
          <span className="text-xs text-slate-500">
            Commander <strong className="font-medium text-slate-300">{incident.commander}</strong>
          </span>
        </div>
      </div>
      <div className="flex border-b border-white/[0.07] px-5">
        <button
          onClick={() => setTab('overview')}
          className={`border-b-2 px-1 py-3 text-xs ${tab === 'overview' ? 'border-[#b6f0d6] text-white' : 'border-transparent text-slate-500'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab('timeline')}
          className={`ml-5 border-b-2 px-1 py-3 text-xs ${tab === 'timeline' ? 'border-[#b6f0d6] text-white' : 'border-transparent text-slate-500'}`}
        >
          Timeline <span className="ml-1 text-slate-600">04</span>
        </button>
      </div>
      <div className="p-5">
        {tab === 'overview' ? (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] tracking-[0.12em] text-slate-600 uppercase">Impact</p>
                <p className="mt-2 text-sm text-slate-300">Elevated errors</p>
              </div>
              <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] tracking-[0.12em] text-slate-600 uppercase">Started</p>
                <p className="mt-2 text-sm text-slate-300">{timeSince(incident.createdAt)} ago</p>
              </div>
            </div>
            <p className="mb-4 text-xs leading-5 text-slate-500">{incident.description}</p>
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  onUpdate({ severity: incident.severity === 'SEV-1' ? 'SEV-2' : 'SEV-1' })
                }
                className="rounded-md border border-red-400/20 px-2.5 py-1.5 text-[11px] text-red-300 hover:bg-red-400/10"
              >
                Change severity
              </button>
              <button className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/[0.05]">
                <MessageSquare size={13} className="mr-1.5 inline" /> Open war room
              </button>
            </div>
            <div className="border-t border-white/[0.06] pt-4">
              <p className="mb-3 text-[10px] tracking-[0.15em] text-slate-600 uppercase">
                Assigned roles
              </p>
              <div className="space-y-2">
                <Role label="Incident Commander" name={incident.commander} />
                <Role label="Communications Lead" name="Unassigned" empty />
                <Role label="Scribe" name="Priya Shah" />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <TimelineItem
              time="now"
              color="bg-[#b6f0d6]"
              text={`Status is ${incident.status}`}
              actor="You"
            />
            <TimelineItem
              time="12 min ago"
              color="bg-orange-300"
              text="Responder joined the incident channel"
              actor="Liam Foster"
            />
            <TimelineItem
              time="18 min ago"
              color="bg-sky-300"
              text="War room channel provisioned"
              actor="IncidentOps"
            />
            <TimelineItem
              time="{timeSince(incident.createdAt)} ago"
              color="bg-red-300"
              text={`Incident declared as ${incident.severity}`}
              actor={incident.commander}
            />
          </div>
        )}
      </div>
    </section>
  );
}
function Role({ label, name, empty }: { label: string; name: string; empty?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`grid size-6 place-items-center rounded-full text-[9px] font-semibold ${empty ? 'border border-dashed border-white/15 text-slate-600' : 'bg-[#435c67] text-slate-100'}`}
      >
        {empty
          ? '+'
          : name
              .split(' ')
              .map((part) => part[0])
              .join('')}
      </div>
      <div className="flex-1">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className={`text-xs ${empty ? 'text-slate-600' : 'text-slate-300'}`}>{name}</p>
      </div>
      {empty ? (
        <button className="text-[11px] text-[#9fdbc0] hover:text-[#b6f0d6]">Assign</button>
      ) : (
        <button className="text-slate-600 hover:text-slate-300">
          <ExternalLink size={13} />
        </button>
      )}
    </div>
  );
}
function TimelineItem({
  time,
  color,
  text,
  actor,
}: {
  time: string;
  color: string;
  text: string;
  actor: string;
}) {
  return (
    <div className="flex gap-3">
      <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${color}`} />
      <div className="flex-1">
        <p className="text-xs text-slate-300">{text}</p>
        <p className="mt-1 text-[10px] text-slate-600">
          {actor} · {time}
        </p>
      </div>
    </div>
  );
}
function DeclareModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (incident: Incident) => void;
}) {
  const [form, setForm] = useState({
    title: '',
    service: 'Public API',
    severity: 'SEV-2',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) return setError(body.error);
    onCreated({
      ...body,
      createdAt: new Date(body.createdAt).toISOString(),
      updatedAt: new Date(body.updatedAt).toISOString(),
    });
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/[0.1] bg-[#12171d] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/[0.07] p-5">
          <div>
            <p className="text-[10px] tracking-[0.18em] text-[#9fdbc0] uppercase">New response</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Declare an incident</h2>
            <p className="mt-1 text-xs text-slate-500">
              This will create a response record and open a war room.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-white/[0.06]"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field label="Incident title">
            <input
              required
              minLength={4}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Elevated API latency"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Service impacted">
              <input
                required
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
              />
            </Field>
            <Field label="Severity">
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option>SEV-1</option>
                <option>SEV-2</option>
                <option>SEV-3</option>
                <option>SEV-4</option>
              </select>
            </Field>
          </div>
          <Field label="Initial description">
            <textarea
              required
              minLength={10}
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is happening and who is impacted?"
            />
          </Field>
          {error && (
            <p className="rounded-md border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.05]"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="rounded-md bg-[#b6f0d6] px-4 py-2 text-xs font-semibold text-[#122019] disabled:opacity-50"
            >
              {loading ? 'Declaring…' : 'Declare incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}
