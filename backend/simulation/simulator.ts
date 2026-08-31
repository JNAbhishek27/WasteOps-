import { db } from '../database/adapter';
import { eventBus } from '../events/eventBus';
import { orchestrator } from '../agents/specialists';

export interface DemoStepState {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  activeEntity: string;
  status: 'IDLE' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED';
}

export class SimulationEngine {
  private isLiveTickerRunning = false;
  private tickerInterval: NodeJS.Timeout | null = null;
  private demoState: DemoStepState = {
    step: 0,
    totalSteps: 8,
    title: 'Ready',
    description: 'Click "Start Autonomous Demo" to begin choreographed hackathon flow.',
    activeEntity: 'NONE',
    status: 'IDLE',
  };

  getDemoState(): DemoStepState {
    return { ...this.demoState };
  }

  isTickerRunning(): boolean {
    return this.isLiveTickerRunning;
  }

  toggleLiveTicker(enable?: boolean): boolean {
    if (enable !== undefined) {
      this.isLiveTickerRunning = enable;
    } else {
      this.isLiveTickerRunning = !this.isLiveTickerRunning;
    }

    if (this.isLiveTickerRunning) {
      if (!this.tickerInterval) {
        this.tickerInterval = setInterval(async () => {
          const bins = await db.getBins();
          // Pick a random bin and increment fill level slightly
          const randomBin = bins[Math.floor(Math.random() * bins.length)];
          if (randomBin && randomBin.fillLevel < 98 && randomBin.sensorHealthy) {
            const increment = Math.floor(Math.random() * 3) + 1;
            const newFill = Math.min(100, randomBin.fillLevel + increment);
            await db.updateBin(randomBin.id, { fillLevel: newFill });

            if (newFill >= 90 && randomBin.fillLevel < 90) {
              await eventBus.publish({
                eventType: 'BIN_REACHED_90',
                binId: randomBin.id,
                details: { fillLevel: newFill, fillRatePerHour: randomBin.fillRatePerHour },
                source: 'IOT_SENSOR',
              });
            }
          }
        }, 5000);
      }
    } else {
      if (this.tickerInterval) {
        clearInterval(this.tickerInterval);
        this.tickerInterval = null;
      }
    }

    return this.isLiveTickerRunning;
  }

  // 1. Preset: Normal Day
  async simulateNormalDay(): Promise<{ message: string; eventCount: number }> {
    const bins = await db.getBins();
    for (const bin of bins) {
      const normalFill = Math.floor(Math.random() * 45) + 20;
      await db.updateBin(bin.id, {
        fillLevel: normalFill,
        status: 'HEALTHY',
        isDamaged: false,
        sensorHealthy: true,
        sensorBattery: 95,
      });
    }

    await eventBus.publish({
      eventType: 'MANUAL_SIMULATION_EVENT',
      details: { scenario: 'NORMAL_DAY_SIMULATION', message: 'All 30 municipal nodes set to nominal baseline.' },
      source: 'SIMULATOR',
    });

    return { message: 'Normal Day simulated. All bins reset to nominal baseline.', eventCount: 30 };
  }

  // 2. Preset: Overflow Crisis
  async simulateOverflowCrisis(): Promise<{ message: string; affectedBins: string[] }> {
    const criticalIds = ['BIN-104', 'BIN-107', 'BIN-109', 'BIN-114', 'BIN-127'];
    for (const bId of criticalIds) {
      await db.updateBin(bId, {
        fillLevel: 96,
        fillRatePerHour: 8.4,
        status: 'CRITICAL_OVERFLOW',
        predictedOverflowAt: 'in 22 minutes',
      });

      await eventBus.publish({
        eventType: 'BIN_REACHED_90',
        binId: bId,
        details: { fillLevel: 96, fillRatePerHour: 8.4, crisis: true },
        source: 'IOT_SENSOR',
      });
    }

    return { message: `Overflow crisis simulated across ${criticalIds.length} high-density bins.`, affectedBins: criticalIds };
  }

  // 3. Preset: Sensor Failure
  async simulateSensorFailure(binId = 'BIN-115'): Promise<{ message: string; binId: string }> {
    await db.updateBin(binId, {
      fillLevel: 0,
      sensorHealthy: false,
      sensorBattery: 0,
      isDamaged: true,
      status: 'DAMAGED_SENSOR_FAIL',
      predictedOverflowAt: 'TELEMETRY_LOST',
    });

    await eventBus.publish({
      eventType: 'BIN_SENSOR_STOPPED',
      binId,
      details: { binId, isDamaged: true, sensorBattery: 0, anomaly: true },
      source: 'IOT_SENSOR',
    });

    return { message: `Sensor failure injected on ${binId}. Telemetry dropped to 0%.`, binId };
  }

  // 4. Preset: Fleet Shortage
  async simulateFleetShortage(): Promise<{ message: string; offlineVehicles: string[] }> {
    const offline = ['TRUCK-01', 'TRUCK-03', 'TRUCK-05'];
    for (const vId of offline) {
      await db.updateVehicle(vId, {
        status: 'MAINTENANCE',
        fuelOrBatteryLevel: 12,
      });
    }

    await eventBus.publish({
      eventType: 'VEHICLE_UNAVAILABLE',
      details: { offlineVehicles: offline, reason: 'Emergency depot battery inverter inspection' },
      source: 'SIMULATOR',
    });

    return { message: `Simulated fleet shortage: ${offline.join(', ')} taken offline.`, offlineVehicles: offline };
  }

  // 5. Preset: 20-Bin City-Wide Surge
  async simulate20BinSurge(): Promise<{ message: string; surgeCount: number }> {
    const bins = await db.getBins();
    const surgeTargets = bins.slice(0, 18);

    for (const bin of surgeTargets) {
      const surgeFill = Math.floor(Math.random() * 15) + 85;
      await db.updateBin(bin.id, {
        fillLevel: surgeFill,
        fillRatePerHour: Math.round((Math.random() * 4 + 4) * 10) / 10,
        status: surgeFill >= 90 ? 'CRITICAL_OVERFLOW' : 'HIGH_RISK',
      });

      await eventBus.publish({
        eventType: 'MULTIPLE_BINS_SURGE',
        binId: bin.id,
        details: { fillLevel: surgeFill, surgeCluster: true },
        source: 'IOT_SENSOR',
      });
    }

    return { message: `City-wide 18-bin surge generated across all 6 municipal zones.`, surgeCount: surgeTargets.length };
  }

  // 6. Choreographed Demo Scenario (Step-by-step or automated)
  async executeDemoScenarioStep(targetStep?: number): Promise<DemoStepState> {
    const nextStep = targetStep !== undefined ? targetStep : this.demoState.step + 1;

    switch (nextStep) {
      case 1: {
        // Step 1: Normal baseline
        await this.simulateNormalDay();
        this.demoState = {
          step: 1,
          totalSteps: 8,
          title: 'Step 1: Baseline City Status',
          description: '30 smart-bins operating nominally across San Francisco municipal zones.',
          activeEntity: 'ALL_BINS',
          status: 'RUNNING',
        };
        break;
      }
      case 2: {
        // Step 2: Sudden surge at BIN-104 (Powell St Station)
        await db.updateBin('BIN-104', {
          fillLevel: 94,
          fillRatePerHour: 7.8,
          status: 'CRITICAL_OVERFLOW',
          predictedOverflowAt: 'in 34 minutes',
        });
        const event = await eventBus.publish({
          eventType: 'BIN_REACHED_90',
          binId: 'BIN-104',
          details: { fillLevel: 94, fillRatePerHour: 7.8, location: 'Powell St Station' },
          source: 'IOT_SENSOR',
        });

        // Directly execute orchestrator event processing
        await orchestrator.processEvent(event);

        this.demoState = {
          step: 2,
          totalSteps: 8,
          title: 'Step 2: Critical Surge Event Detected',
          description: 'BIN-104 surges to 94% with 7.8%/hr fill rate at Powell St Station.',
          activeEntity: 'BIN-104',
          status: 'RUNNING',
        };
        break;
      }
      case 3: {
        // Step 3: Triage & Memory Retrieval
        this.demoState = {
          step: 3,
          totalSteps: 8,
          title: 'Step 3: Specialist Triage & Memory Recall',
          description: 'Triage Agent flags incident as CRITICAL (34 min to overflow). Memory retrieves 14 prior surges.',
          activeEntity: 'Triage Agent & Memory Service',
          status: 'RUNNING',
        };
        break;
      }
      case 4: {
        // Step 4: Route Optimization
        this.demoState = {
          step: 4,
          totalSteps: 8,
          title: 'Step 4: Autonomous Route Planning',
          description: 'Route Agent selects TRUCK-07 (Apollo Compactor) with nearby cluster BIN-105.',
          activeEntity: 'Route Agent (TRUCK-07)',
          status: 'RUNNING',
        };
        break;
      }
      case 5: {
        // Step 5: Approval Required
        this.demoState = {
          step: 5,
          totalSteps: 8,
          title: 'Step 5: Human-In-The-Loop Approval',
          description: 'Sensitive downtown emergency dispatch paused. Operations Manager review requested.',
          activeEntity: 'Approval Center (APP-104)',
          status: 'WAITING_APPROVAL',
        };
        break;
      }
      case 6: {
        // Step 6: Operator approves in Approval Center
        const approvals = await db.getApprovals();
        const pendingApp = approvals.find((a) => a.binId === 'BIN-104' || a.status === 'PENDING');
        if (pendingApp) {
          await db.updateApproval(pendingApp.id, {
            status: 'APPROVED',
            decidedAt: new Date().toISOString(),
            decidedBy: 'Operations Manager',
          });
          await db.updateTask(pendingApp.taskId, { status: 'ACTIVE' });
          await db.updateVehicle('TRUCK-07', { status: 'COLLECTING' });
        }

        this.demoState = {
          step: 6,
          totalSteps: 8,
          title: 'Step 6: Task Approved & Vehicle En Route',
          description: 'Operator signed off. Task WT-1042 marked ACTIVE. TRUCK-07 dispatched.',
          activeEntity: 'TRUCK-07',
          status: 'RUNNING',
        };
        break;
      }
      case 7: {
        // Step 7: Collection occurs (Simulator reports fill drop)
        await db.updateBin('BIN-104', {
          fillLevel: 14,
          status: 'HEALTHY',
          lastCollection: 'Just now',
          predictedOverflowAt: 'in >24 hours',
        });
        await db.updateBin('BIN-105', {
          fillLevel: 18,
          status: 'HEALTHY',
          lastCollection: 'Just now',
        });

        // Trigger verification agent
        const tasks = await db.getTasks();
        const activeTask = tasks.find((t) => t.primaryBinId === 'BIN-104');
        if (activeTask) {
          await orchestrator.verifyTask(activeTask.id);
        }

        this.demoState = {
          step: 7,
          totalSteps: 8,
          title: 'Step 7: Autonomous Telemetry Verification',
          description: 'Smart sensor confirms fill dropped from 94% to 14%. Verification Agent records SUCCESS.',
          activeEntity: 'Verification Agent',
          status: 'RUNNING',
        };
        break;
      }
      case 8: {
        // Step 8: Complete & Learned
        this.demoState = {
          step: 8,
          totalSteps: 8,
          title: 'Step 8: Task Completed & Memory Updated',
          description: 'Full autonomous loop verified: PERCEPTION → TRIAGE → ROUTE → APPROVAL → VERIFY → LEARN.',
          activeEntity: 'WasteOps Orchestrator',
          status: 'COMPLETED',
        };
        break;
      }
      default: {
        this.demoState = {
          step: 0,
          totalSteps: 8,
          title: 'Ready',
          description: 'Click "Start Autonomous Demo" to begin choreographed hackathon flow.',
          activeEntity: 'NONE',
          status: 'IDLE',
        };
        break;
      }
    }

    return this.demoState;
  }
}

export const simulator = new SimulationEngine();

// Subscribe orchestrator to incoming event bus events
eventBus.subscribe(async (event) => {
  if (event.eventType === 'BIN_REACHED_90' || event.eventType === 'BIN_REACHED_100' || event.eventType === 'BIN_SENSOR_STOPPED') {
    await orchestrator.processEvent(event);
  }
});
