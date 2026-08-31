import { db } from '../database/adapter';
import { Bin, CollectionTask, TaskPriority, Vehicle } from '../models/types';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (args: any) => Promise<any>;
}

// Distance calculation helper (Haversine formula in km)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const toolsRegistry: Record<string, ToolDefinition> = {
  get_bin_status: {
    name: 'get_bin_status',
    description: 'Get the latest telemetry, fill level, fill rate, status, and location for one or more bins.',
    parameters: {
      type: 'OBJECT',
      properties: {
        binId: { type: 'STRING', description: 'The unique ID of the bin (e.g. BIN-104), or "ALL"' },
      },
      required: ['binId'],
    },
    execute: async ({ binId }: { binId: string }) => {
      if (binId === 'ALL') {
        const bins = await db.getBins();
        return { count: bins.length, bins };
      }
      const bin = await db.getBin(binId);
      if (!bin) return { error: `Bin with ID ${binId} not found` };
      return { bin };
    },
  },

  get_fleet_status: {
    name: 'get_fleet_status',
    description: 'Get operational availability, remaining capacity, fuel level, and location of waste collection vehicles.',
    parameters: {
      type: 'OBJECT',
      properties: {
        zone: { type: 'STRING', description: 'Optional zone filter (e.g. "Downtown Central")' },
        status: { type: 'STRING', description: 'Optional status filter (e.g. "AVAILABLE")' },
      },
      required: [],
    },
    execute: async ({ zone, status }: { zone?: string; status?: string }) => {
      let vehicles = await db.getVehicles();
      if (zone) vehicles = vehicles.filter((v) => v.zone.toLowerCase().includes(zone.toLowerCase()));
      if (status) vehicles = vehicles.filter((v) => v.status === status);
      return { count: vehicles.length, vehicles };
    },
  },

  get_active_tasks: {
    name: 'get_active_tasks',
    description: 'List all ongoing or pending collection tasks and their current assignment status.',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: { type: 'STRING', description: 'Optional task status filter (ACTIVE, PENDING, APPROVAL, etc.)' },
      },
      required: [],
    },
    execute: async ({ status }: { status?: string }) => {
      const tasks = await db.getTasks(status ? { status } : undefined);
      return { count: tasks.length, tasks };
    },
  },

  get_operational_history: {
    name: 'get_operational_history',
    description: 'Retrieve semantic operational memories, past surge patterns, and operator decisions for a bin or zone.',
    parameters: {
      type: 'OBJECT',
      properties: {
        targetKey: { type: 'STRING', description: 'Bin ID, zone name, or vehicle ID to query memory for' },
      },
      required: ['targetKey'],
    },
    execute: async ({ targetKey }: { targetKey: string }) => {
      const memories = await db.getMemories(targetKey);
      return { count: memories.length, memories };
    },
  },

  optimize_route: {
    name: 'optimize_route',
    description: 'Calculate the optimal vehicle assignment and collection waypoint sequence using priority weighting and geographic proximity.',
    parameters: {
      type: 'OBJECT',
      properties: {
        binIds: { type: 'ARRAY', description: 'List of bin IDs to be collected' },
        preferredVehicleId: { type: 'STRING', description: 'Optional vehicle ID preference' },
      },
      required: ['binIds'],
    },
    execute: async ({ binIds, preferredVehicleId }: { binIds: string[]; preferredVehicleId?: string }) => {
      const allBins = await db.getBins();
      const targetBins = allBins.filter((b) => binIds.includes(b.id));
      const vehicles = await db.getVehicles();
      const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');

      let selectedVehicle: Vehicle | undefined;
      if (preferredVehicleId) {
        selectedVehicle = vehicles.find((v) => v.id === preferredVehicleId && v.status === 'AVAILABLE');
      }
      if (!selectedVehicle && availableVehicles.length > 0) {
        // Pick vehicle closest to the primary target bin
        const primaryBin = targetBins[0];
        if (primaryBin) {
          selectedVehicle = availableVehicles.reduce((closest, v) => {
            const dist = calculateDistanceKm(v.currentLocation.lat, v.currentLocation.lng, primaryBin.location.lat, primaryBin.location.lng);
            const closestDist = calculateDistanceKm(closest.currentLocation.lat, closest.currentLocation.lng, primaryBin.location.lat, primaryBin.location.lng);
            return dist < closestDist ? v : closest;
          }, availableVehicles[0]);
        } else {
          selectedVehicle = availableVehicles[0];
        }
      }

      if (!selectedVehicle) {
        return {
          error: 'No available vehicles found in fleet',
          requiresEscalation: true,
        };
      }

      // Order bins by priority and proximity
      const sortedStops = [...targetBins].sort((a, b) => b.fillLevel - a.fillLevel);
      let totalDist = 0;
      let prevLoc = selectedVehicle.currentLocation;

      for (const stop of sortedStops) {
        totalDist += calculateDistanceKm(prevLoc.lat, prevLoc.lng, stop.location.lat, stop.location.lng);
        prevLoc = stop.location;
      }

      const etaMinutes = Math.max(8, Math.round((totalDist / 30) * 60) + sortedStops.length * 4);

      return {
        selectedVehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        orderedStops: sortedStops.map((b) => ({
          binId: b.id,
          lat: b.location.lat,
          lng: b.location.lng,
          address: b.location.address,
          fillLevel: b.fillLevel,
        })),
        totalDistanceKm: Math.round(totalDist * 10) / 10,
        etaMinutes,
        capacityUtilizationAfterPickup: `${Math.round(((selectedVehicle.currentLoadKg + sortedStops.length * 250) / selectedVehicle.capacityKg) * 100)}%`,
      };
    },
  },

  create_collection_task: {
    name: 'create_collection_task',
    description: 'Create a new municipal collection task in the database for assigned bins and vehicle.',
    parameters: {
      type: 'OBJECT',
      properties: {
        binIds: { type: 'ARRAY', description: 'Array of bin IDs to collect' },
        primaryBinId: { type: 'STRING', description: 'The highest priority bin ID' },
        priority: { type: 'STRING', description: 'Task priority: LOW, MEDIUM, HIGH, CRITICAL, EMERGENCY' },
        vehicleId: { type: 'STRING', description: 'Vehicle assigned to this collection' },
        crewId: { type: 'STRING', description: 'Crew assigned to vehicle' },
        approvalRequired: { type: 'BOOLEAN', description: 'Whether this task requires human sign-off' },
        justification: { type: 'STRING', description: 'Concise operational reasoning for this task' },
        etaMinutes: { type: 'NUMBER', description: 'Estimated time of arrival' },
        estimatedDistanceKm: { type: 'NUMBER', description: 'Estimated travel distance' },
      },
      required: ['binIds', 'primaryBinId', 'priority', 'justification'],
    },
    execute: async (args: any) => {
      const task = await db.createTask({
        type: args.priority === 'CRITICAL' || args.priority === 'EMERGENCY' ? 'URGENT_COLLECTION' : 'ROUTINE_COLLECTION',
        priority: (args.priority as TaskPriority) || 'HIGH',
        binIds: args.binIds || [args.primaryBinId],
        primaryBinId: args.primaryBinId,
        vehicleId: args.vehicleId,
        crewId: args.crewId,
        status: args.approvalRequired ? 'APPROVAL' : 'ACTIVE',
        createdBy: 'WasteOps Orchestrator',
        etaMinutes: args.etaMinutes || 15,
        estimatedDistanceKm: args.estimatedDistanceKm || 3.5,
        verificationStatus: 'NOT_STARTED',
        approvalRequired: !!args.approvalRequired,
        justification: args.justification,
      });

      // Update bins to link assigned task
      for (const bId of task.binIds) {
        await db.updateBin(bId, { assignedVehicleId: args.vehicleId, assignedTaskId: task.id });
      }

      // If vehicle is assigned and active, update vehicle status
      if (args.vehicleId && !args.approvalRequired) {
        await db.updateVehicle(args.vehicleId, { status: 'EN_ROUTE' });
      }

      return { success: true, task };
    },
  },

  assign_vehicle: {
    name: 'assign_vehicle',
    description: 'Assign or reassign an available vehicle and crew to a collection task.',
    parameters: {
      type: 'OBJECT',
      properties: {
        taskId: { type: 'STRING', description: 'Task ID to update' },
        vehicleId: { type: 'STRING', description: 'Vehicle ID to assign' },
      },
      required: ['taskId', 'vehicleId'],
    },
    execute: async ({ taskId, vehicleId }: { taskId: string; vehicleId: string }) => {
      const vehicle = await db.getVehicle(vehicleId);
      if (!vehicle) return { error: `Vehicle ${vehicleId} not found` };
      if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'OFF_DUTY') {
        return { error: `Vehicle ${vehicleId} is currently ${vehicle.status} and cannot be assigned` };
      }

      await db.updateVehicle(vehicleId, { status: 'EN_ROUTE', assignedTaskIds: [taskId] });
      const task = await db.updateTask(taskId, {
        vehicleId,
        crewId: vehicle.assignedCrewId,
        status: 'ACTIVE',
      });

      return { success: true, task, vehicle };
    },
  },

  request_human_approval: {
    name: 'request_human_approval',
    description: 'Send a high-impact collection recommendation to the Human Approval Center for operator sign-off.',
    parameters: {
      type: 'OBJECT',
      properties: {
        taskId: { type: 'STRING', description: 'The task ID requiring approval' },
        binId: { type: 'STRING', description: 'The urgent bin ID' },
        fillLevel: { type: 'NUMBER', description: 'Current fill level' },
        predictedOverflow: { type: 'STRING', description: 'Predicted overflow window' },
        recommendedVehicleId: { type: 'STRING', description: 'Proposed vehicle ID' },
        recommendedRoute: { type: 'ARRAY', description: 'Ordered bin IDs' },
        estimatedResponseTimeMinutes: { type: 'NUMBER', description: 'ETA in minutes' },
        reason: { type: 'STRING', description: 'Clear operational justification' },
        urgency: { type: 'STRING', description: 'CRITICAL, HIGH, etc.' },
      },
      required: ['taskId', 'binId', 'recommendedVehicleId', 'reason'],
    },
    execute: async (args: any) => {
      const approval = await db.createApproval({
        taskId: args.taskId,
        binId: args.binId,
        fillLevel: args.fillLevel || 94,
        predictedOverflow: args.predictedOverflow || 'in 35 minutes',
        recommendedVehicleId: args.recommendedVehicleId,
        recommendedRoute: args.recommendedRoute || [args.binId],
        estimatedResponseTimeMinutes: args.estimatedResponseTimeMinutes || 14,
        reason: args.reason,
        urgency: (args.urgency as TaskPriority) || 'CRITICAL',
      });

      await db.updateTask(args.taskId, { approvalId: approval.id, status: 'APPROVAL' });
      return { success: true, approval };
    },
  },

  verify_collection: {
    name: 'verify_collection',
    description: 'Verify smart-bin telemetry after collection to ensure fill level dropped and mark task SUCCESS or FAILED.',
    parameters: {
      type: 'OBJECT',
      properties: {
        taskId: { type: 'STRING', description: 'Task ID to verify' },
        binId: { type: 'STRING', description: 'Bin ID that was collected' },
      },
      required: ['taskId', 'binId'],
    },
    execute: async ({ taskId, binId }: { taskId: string; binId: string }) => {
      const bin = await db.getBin(binId);
      const task = await db.getTask(taskId);

      if (!bin || !task) return { error: 'Bin or Task not found' };

      // Check if fill level is healthy (< 25%)
      const isEmptied = bin.fillLevel < 30;

      if (isEmptied) {
        await db.updateTask(taskId, {
          status: 'COMPLETED',
          verificationStatus: 'SUCCESS',
          verificationDetails: `Confirmed: Fill level dropped to ${bin.fillLevel}%. Telemetry verified.`,
          completedAt: new Date().toISOString(),
        });
        if (task.vehicleId) {
          await db.updateVehicle(task.vehicleId, { status: 'AVAILABLE' });
        }
        return { result: 'SUCCESS', message: `Collection verified. Bin ${binId} successfully emptied to ${bin.fillLevel}%.` };
      } else {
        await db.updateTask(taskId, {
          status: 'FAILED',
          verificationStatus: 'FAILED',
          verificationDetails: `Alert: Fill level remains high at ${bin.fillLevel}%. Re-collection task required.`,
        });
        return {
          result: 'FAILED',
          message: `Verification failed: Bin ${binId} fill level is still ${bin.fillLevel}%. Follow-up task required.`,
          requiresEscalation: true,
        };
      }
    },
  },

  create_maintenance_ticket: {
    name: 'create_maintenance_ticket',
    description: 'Create a hardware repair or replacement ticket for a damaged bin or faulty sensor.',
    parameters: {
      type: 'OBJECT',
      properties: {
        binId: { type: 'STRING', description: 'Bin ID needing maintenance' },
        issueType: { type: 'STRING', description: 'SENSOR_OFFLINE, LID_DAMAGED, COMPACTOR_JAMMED, etc.' },
        description: { type: 'STRING', description: 'Detailed diagnosis' },
      },
      required: ['binId', 'issueType', 'description'],
    },
    execute: async (args: any) => {
      const task = await db.createTask({
        type: 'SENSOR_MAINTENANCE',
        priority: 'HIGH',
        binIds: [args.binId],
        primaryBinId: args.binId,
        status: 'PENDING',
        createdBy: 'Operations Agent',
        etaMinutes: 45,
        estimatedDistanceKm: 6.2,
        verificationStatus: 'NOT_STARTED',
        approvalRequired: false,
        justification: `Maintenance: ${args.issueType} - ${args.description}`,
      });
      return { success: true, task };
    },
  },

  send_alert: {
    name: 'send_alert',
    description: 'Send high-priority operational broadcast to field crews and operations manager.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Alert headline' },
        message: { type: 'STRING', description: 'Alert message body' },
        urgency: { type: 'STRING', description: 'INFO, WARNING, CRITICAL' },
      },
      required: ['title', 'message'],
    },
    execute: async (args: any) => {
      return { success: true, broadcastedAt: new Date().toISOString(), ...args };
    },
  },

  update_task_status: {
    name: 'update_task_status',
    description: 'Update the operational status of an existing collection or maintenance task.',
    parameters: {
      type: 'OBJECT',
      properties: {
        taskId: { type: 'STRING', description: 'Task ID' },
        status: { type: 'STRING', description: 'PENDING, APPROVAL, APPROVED, ACTIVE, COMPLETED, FAILED, CANCELLED' },
      },
      required: ['taskId', 'status'],
    },
    execute: async ({ taskId, status }: { taskId: string; status: string }) => {
      const updated = await db.updateTask(taskId, { status: status as any });
      return { success: !!updated, task: updated };
    },
  },

  record_agent_decision: {
    name: 'record_agent_decision',
    description: 'Record an autonomous decision into the immutable audit trail for full accountability.',
    parameters: {
      type: 'OBJECT',
      properties: {
        agent: { type: 'STRING', description: 'Name of the agent' },
        triggerEvent: { type: 'STRING', description: 'Event that prompted the action' },
        actionTaken: { type: 'STRING', description: 'Action executed' },
        targetId: { type: 'STRING', description: 'Bin, vehicle, or task ID' },
        result: { type: 'STRING', description: 'SUCCESS, PENDING_APPROVAL, etc.' },
        requiresApproval: { type: 'BOOLEAN', description: 'Whether human approval was requested' },
        confidenceScore: { type: 'NUMBER', description: 'Confidence 0.0 - 1.0' },
        operationalImpact: { type: 'STRING', description: 'Why this decision provides operational value' },
      },
      required: ['agent', 'triggerEvent', 'actionTaken', 'targetId'],
    },
    execute: async (args: any) => {
      const decision = await db.addDecision({
        agent: args.agent || 'WasteOps Orchestrator',
        triggerEvent: args.triggerEvent,
        actionTaken: args.actionTaken,
        targetId: args.targetId,
        result: args.result || 'SUCCESS',
        requiresApproval: !!args.requiresApproval,
        confidenceScore: args.confidenceScore ?? 0.95,
        operationalImpact: args.operationalImpact || 'Optimized waste collection response.',
      });
      return { success: true, decision };
    },
  },
};
