import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { db } from './index';
import { actionItems, incidentEvents, incidents, publicStatusUpdates } from './schema';

const now = new Date();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

const seed = async () => {
  const existing = db.select().from(incidents).all();
  if (existing.length > 0) return;

  const apiIncident = {
    id: 'inc_api_latency',
    number: 104,
    title: 'Elevated API latency in us-east-1',
    service: 'Public API',
    description: 'p95 latency crossed the 1.5s threshold for authenticated API traffic.',
    severity: 'SEV-1',
    status: 'Investigating',
    commander: 'Maya Chen',
    createdAt: hoursAgo(1.7),
    updatedAt: hoursAgo(0.1),
  };
  const checkoutIncident = {
    id: 'inc_checkout_errors',
    number: 103,
    title: 'Checkout error rate above threshold',
    service: 'Checkout',
    description: 'Payment authorization failures are elevated for a subset of EU customers.',
    severity: 'SEV-2',
    status: 'Identified',
    commander: 'Jordan Lee',
    createdAt: hoursAgo(4.2),
    updatedAt: hoursAgo(0.8),
  };
  const searchIncident = {
    id: 'inc_search_degraded',
    number: 102,
    title: 'Search results intermittently stale',
    service: 'Search',
    description: 'Index refresh is delayed by up to 12 minutes in the secondary cluster.',
    severity: 'SEV-3',
    status: 'Monitoring',
    commander: 'Avery Patel',
    createdAt: hoursAgo(19),
    updatedAt: hoursAgo(2),
  };

  db.insert(incidents).values([apiIncident, checkoutIncident, searchIncident]).run();
  db.insert(incidentEvents)
    .values([
      {
        id: randomUUID(),
        incidentId: apiIncident.id,
        kind: 'status',
        message: 'Incident declared as SEV-1',
        actor: 'Maya Chen',
        createdAt: hoursAgo(1.7),
      },
      {
        id: randomUUID(),
        incidentId: apiIncident.id,
        kind: 'role',
        message: 'Maya Chen assigned as Incident Commander',
        actor: 'System',
        createdAt: hoursAgo(1.68),
      },
      {
        id: randomUUID(),
        incidentId: apiIncident.id,
        kind: 'update',
        message: 'Slack war room #inc-104-api-latency provisioned',
        actor: 'IncidentOps',
        createdAt: hoursAgo(1.65),
      },
      {
        id: randomUUID(),
        incidentId: apiIncident.id,
        kind: 'status',
        message: 'Status updated to Investigating',
        actor: 'Maya Chen',
        createdAt: hoursAgo(0.1),
      },
      {
        id: randomUUID(),
        incidentId: checkoutIncident.id,
        kind: 'status',
        message: 'Status updated to Identified',
        actor: 'Jordan Lee',
        createdAt: hoursAgo(0.8),
      },
      {
        id: randomUUID(),
        incidentId: searchIncident.id,
        kind: 'status',
        message: 'Status updated to Monitoring',
        actor: 'Avery Patel',
        createdAt: hoursAgo(2),
      },
    ])
    .run();
  db.insert(actionItems)
    .values([
      {
        id: randomUUID(),
        incidentId: apiIncident.id,
        title: 'Add latency guardrail to the API gateway',
        assignee: 'Elias Morgan',
        dueDate: 'Today',
        status: 'Open',
      },
      {
        id: randomUUID(),
        incidentId: apiIncident.id,
        title: 'Review us-east-1 connection pool limits',
        assignee: 'Priya Shah',
        dueDate: 'Tomorrow',
        status: 'Open',
      },
      {
        id: randomUUID(),
        incidentId: checkoutIncident.id,
        title: 'Add authorization failure alert grouping',
        assignee: 'Jordan Lee',
        dueDate: 'May 28',
        status: 'In progress',
      },
    ])
    .run();
  db.insert(publicStatusUpdates)
    .values({
      id: randomUUID(),
      incidentId: searchIncident.id,
      title: 'Search indexing delays',
      body: 'We are monitoring a delay affecting freshness for some search results. Core search remains available.',
      component: 'Search',
      status: 'Monitoring',
      published: true,
      createdAt: hoursAgo(2),
    })
    .run();
};

seed();
