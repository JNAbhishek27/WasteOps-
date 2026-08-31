import { Router, Request, Response } from 'express';
import { db } from '../database/adapter';
import { eventBus } from '../events/eventBus';
import { orchestrator, handleAgentConsoleMessage } from '../agents/specialists';
import { simulator } from '../simulation/simulator';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'WasteOps Autonomous AI Agent Platform',
    timestamp: new Date().toISOString(),
  });
});

// System Status (Google Cloud vs Local Development status)
apiRouter.get('/system/status', async (req: Request, res: Response) => {
  const isGcp = !!process.env.GOOGLE_CLOUD_PROJECT;
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';

  res.json({
    mode: isGcp ? 'GOOGLE_CLOUD' : 'LOCAL_DEVELOPMENT',
    gemini: hasGeminiKey ? 'CONNECTED' : 'USING_FALLBACK_AI',
    firestore: process.env.FIRESTORE_DATABASE ? 'CONNECTED' : 'LOCAL_ADAPTER',
    pubsub: process.env.PUBSUB_TOPIC ? 'CONNECTED' : 'LOCAL_EVENT_BUS',
    cloudRun: process.env.K_SERVICE ? 'DEPLOYED_ENV' : 'DEV_CONTAINER',
    activeSimulation: simulator.isTickerRunning(),
    demoModeRunning: simulator.getDemoState().status === 'RUNNING',
    demoStep: simulator.getDemoState().step,
  });
});

// -------------------------------------------------------------
// BINS
// -------------------------------------------------------------
apiRouter.get('/bins', async (req: Request, res: Response) => {
  const bins = await db.getBins();
  res.json(bins);
});

apiRouter.get('/bins/:id', async (req: Request, res: Response) => {
  const bin = await db.getBin(req.params.id);
  if (!bin) return res.status(404).json({ error: 'Bin not found' });
  res.json(bin);
});

apiRouter.patch('/bins/:id', async (req: Request, res: Response) => {
  const updated = await db.updateBin(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Bin not found' });
  res.json(updated);
});

// -------------------------------------------------------------
// VEHICLES & CREWS
// -------------------------------------------------------------
apiRouter.get('/vehicles', async (req: Request, res: Response) => {
  const vehicles = await db.getVehicles();
  res.json(vehicles);
});

apiRouter.get('/crews', async (req: Request, res: Response) => {
  const crews = await db.getCrews();
  res.json(crews);
});

// -------------------------------------------------------------
// TASKS
// -------------------------------------------------------------
apiRouter.get('/tasks', async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const tasks = await db.getTasks(status ? { status } : undefined);
  res.json(tasks);
});

apiRouter.post('/tasks', async (req: Request, res: Response) => {
  const task = await db.createTask(req.body);
  res.status(201).json(task);
});

apiRouter.post('/tasks/:id/approve', async (req: Request, res: Response) => {
  const task = await db.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  await db.updateTask(task.id, { status: 'ACTIVE' });
  if (task.approvalId) {
    await db.updateApproval(task.approvalId, {
      status: 'APPROVED',
      decidedAt: new Date().toISOString(),
      decidedBy: 'Operations Manager',
    });
  }
  if (task.vehicleId) {
    await db.updateVehicle(task.vehicleId, { status: 'COLLECTING' });
  }

  res.json({ success: true, message: `Task ${task.id} approved and dispatched.` });
});

apiRouter.post('/tasks/:id/reject', async (req: Request, res: Response) => {
  const task = await db.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  await db.updateTask(task.id, { status: 'CANCELLED' });
  if (task.approvalId) {
    await db.updateApproval(task.approvalId, {
      status: 'REJECTED',
      decidedAt: new Date().toISOString(),
      decidedBy: 'Operations Manager',
      modificationNotes: req.body?.reason || 'Operator rejected recommended action.',
    });
  }

  res.json({ success: true, message: `Task ${task.id} rejected and cancelled.` });
});

apiRouter.post('/tasks/:id/complete', async (req: Request, res: Response) => {
  const result = await orchestrator.verifyTask(req.params.id);
  res.json(result);
});

// -------------------------------------------------------------
// APPROVALS
// -------------------------------------------------------------
apiRouter.get('/approvals', async (req: Request, res: Response) => {
  const approvals = await db.getApprovals();
  res.json(approvals);
});

apiRouter.post('/approvals/:id/decide', async (req: Request, res: Response) => {
  const { decision, modificationNotes } = req.body; // 'APPROVE' | 'REJECT' | 'MODIFY'
  const approval = await db.getApproval(req.params.id);
  if (!approval) return res.status(404).json({ error: 'Approval request not found' });

  if (decision === 'APPROVE') {
    await db.updateApproval(approval.id, {
      status: 'APPROVED',
      decidedAt: new Date().toISOString(),
      decidedBy: 'Operations Manager',
    });
    await db.updateTask(approval.taskId, { status: 'ACTIVE' });
    await db.updateVehicle(approval.recommendedVehicleId, { status: 'EN_ROUTE' });
    return res.json({ success: true, status: 'APPROVED' });
  } else if (decision === 'REJECT') {
    await db.updateApproval(approval.id, {
      status: 'REJECTED',
      decidedAt: new Date().toISOString(),
      decidedBy: 'Operations Manager',
      modificationNotes,
    });
    await db.updateTask(approval.taskId, { status: 'CANCELLED' });
    return res.json({ success: true, status: 'REJECTED' });
  } else if (decision === 'MODIFY') {
    await db.updateApproval(approval.id, {
      status: 'MODIFIED',
      decidedAt: new Date().toISOString(),
      decidedBy: 'Operations Manager',
      modificationNotes,
    });
    await db.updateTask(approval.taskId, {
      status: 'ACTIVE',
      justification: `Operator modified route: ${modificationNotes || 'Custom adjustments applied.'}`,
    });
    return res.json({ success: true, status: 'MODIFIED' });
  }

  res.status(400).json({ error: 'Invalid decision type' });
});

// -------------------------------------------------------------
// EVENTS
// -------------------------------------------------------------
apiRouter.get('/events', async (req: Request, res: Response) => {
  const events = await db.getEvents(50);
  res.json(events);
});

apiRouter.post('/events', async (req: Request, res: Response) => {
  const event = await eventBus.publish(req.body);
  res.status(201).json(event);
});

// -------------------------------------------------------------
// AGENT ACTIVITY, DECISIONS, MEMORIES, CONSOLE
// -------------------------------------------------------------
apiRouter.get('/agent/activity', async (req: Request, res: Response) => {
  const steps = await db.getActivitySteps(60);
  res.json(steps);
});

apiRouter.get('/agent/decisions', async (req: Request, res: Response) => {
  const decisions = await db.getDecisions(40);
  res.json(decisions);
});

apiRouter.get('/agent/memories', async (req: Request, res: Response) => {
  const targetKey = req.query.targetKey as string | undefined;
  const memories = await db.getMemories(targetKey);
  res.json(memories);
});

apiRouter.post('/agent/process', async (req: Request, res: Response) => {
  const event = req.body;
  const outcome = await orchestrator.processEvent(event);
  res.json(outcome);
});

apiRouter.post('/agent/console', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const result = await handleAgentConsoleMessage(message);
  res.json(result);
});

// -------------------------------------------------------------
// ANALYTICS & METRICS
// -------------------------------------------------------------
apiRouter.get('/analytics', async (req: Request, res: Response) => {
  const metrics = await db.getMetrics();
  const bins = await db.getBins();
  const tasks = await db.getTasks();
  const vehicles = await db.getVehicles();

  // Zone distribution
  const zoneStats: Record<string, { total: number; critical: number; healthy: number }> = {};
  bins.forEach((b) => {
    if (!zoneStats[b.zone]) zoneStats[b.zone] = { total: 0, critical: 0, healthy: 0 };
    zoneStats[b.zone].total += 1;
    if (b.fillLevel >= 85) zoneStats[b.zone].critical += 1;
    else zoneStats[b.zone].healthy += 1;
  });

  // Time-series mock data for overflow trends
  const hourlyTrends = [
    { hour: '06:00', incidents: 2, resolved: 2, latencySec: 2.1 },
    { hour: '08:00', incidents: 6, resolved: 5, latencySec: 1.9 },
    { hour: '10:00', incidents: 11, resolved: 10, latencySec: 1.8 },
    { hour: '12:00', incidents: 14, resolved: 13, latencySec: 1.7 },
    { hour: '14:00', incidents: 9, resolved: 9, latencySec: 1.6 },
    { hour: '16:00', incidents: 7, resolved: 7, latencySec: 1.8 },
    { hour: '18:00', incidents: 4, resolved: 4, latencySec: 2.0 },
  ];

  res.json({
    metrics,
    zoneStats,
    hourlyTrends,
    fleetCount: vehicles.length,
    activeTasksCount: tasks.filter((t) => t.status === 'ACTIVE').length,
    completedTasksCount: tasks.filter((t) => t.status === 'COMPLETED').length,
  });
});

// -------------------------------------------------------------
// SIMULATOR & DEMO CONTROLLER
// -------------------------------------------------------------
apiRouter.post('/simulate/preset', async (req: Request, res: Response) => {
  const { preset } = req.body;

  switch (preset) {
    case 'NORMAL_DAY':
      return res.json(await simulator.simulateNormalDay());
    case 'OVERFLOW_CRISIS':
      return res.json(await simulator.simulateOverflowCrisis());
    case 'SENSOR_FAILURE':
      return res.json(await simulator.simulateSensorFailure(req.body.binId));
    case 'FLEET_SHORTAGE':
      return res.json(await simulator.simulateFleetShortage());
    case '20_BIN_SURGE':
      return res.json(await simulator.simulate20BinSurge());
    default:
      return res.status(400).json({ error: 'Unknown simulation preset' });
  }
});

apiRouter.get('/simulate/demo-state', (req: Request, res: Response) => {
  res.json(simulator.getDemoState());
});

apiRouter.post('/simulate/demo-step', async (req: Request, res: Response) => {
  const step = req.body?.step !== undefined ? Number(req.body.step) : undefined;
  const nextState = await simulator.executeDemoScenarioStep(step);
  res.json(nextState);
});

apiRouter.post('/simulate/ticker-toggle', (req: Request, res: Response) => {
  const running = simulator.toggleLiveTicker(req.body?.enable);
  res.json({ isRunning: running });
});

apiRouter.post('/simulate/reset', async (req: Request, res: Response) => {
  await db.resetToSeed();
  simulator.executeDemoScenarioStep(0);
  res.json({ success: true, message: 'All operational data reset to clean seed state.' });
});
