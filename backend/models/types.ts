export type BinStatus = 'HEALTHY' | 'APPROACHING_CAPACITY' | 'HIGH_RISK' | 'CRITICAL_OVERFLOW' | 'DAMAGED_SENSOR_FAIL';
export type WasteType = 'mixed' | 'organic' | 'recyclable' | 'hazardous' | 'electronic';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'PENDING' | 'APPROVAL' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
export type VehicleStatus = 'AVAILABLE' | 'EN_ROUTE' | 'COLLECTING' | 'MAINTENANCE' | 'OFF_DUTY';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  zone: string;
}

export interface Bin {
  id: string;
  location: Location;
  fillLevel: number; // 0 - 100 (%)
  fillRatePerHour: number; // % per hour
  wasteType: WasteType;
  status: BinStatus;
  capacityLiters: number;
  lastCollection: string;
  predictedOverflowAt: string; // ISO or human string
  sensorBattery: number; // 0 - 100 (%)
  sensorHealthy: boolean;
  isDamaged: boolean;
  assignedVehicleId?: string;
  assignedTaskId?: string;
  zone: string;
  historicalOverflowCount: number;
  notes?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'compactor_truck' | 'side_loader' | 'electric_hauler' | 'mini_collector';
  capacityKg: number;
  currentLoadKg: number;
  status: VehicleStatus;
  currentLocation: Location;
  assignedCrewId?: string;
  assignedTaskIds: string[];
  fuelOrBatteryLevel: number;
  speedKmh: number;
  zone: string;
}

export interface Crew {
  id: string;
  name: string;
  lead: string;
  membersCount: number;
  phone: string;
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  assignedVehicleId?: string;
  status: 'ACTIVE' | 'ON_BREAK' | 'OFF_DUTY';
}

export interface OperationalEvent {
  id: string;
  timestamp: string;
  eventType: 
    | 'BIN_FILL_INCREASED'
    | 'BIN_REACHED_90'
    | 'BIN_REACHED_100'
    | 'BIN_SENSOR_STOPPED'
    | 'BIN_DAMAGED'
    | 'COLLECTION_MISSED'
    | 'VEHICLE_UNAVAILABLE'
    | 'VEHICLE_CAPACITY_CHANGED'
    | 'MULTIPLE_BINS_SURGE'
    | 'MANUAL_SIMULATION_EVENT';
  binId?: string;
  vehicleId?: string;
  details: Record<string, any>;
  processed: boolean;
  processedAt?: string;
  source: 'SIMULATOR' | 'IOT_SENSOR' | 'DISPATCH_OPERATOR' | 'SYSTEM';
}

export interface CollectionTask {
  id: string;
  type: 'URGENT_COLLECTION' | 'ROUTINE_COLLECTION' | 'SENSOR_MAINTENANCE' | 'BIN_REPLACEMENT' | 'OVERFLOW_EMERGENCY';
  priority: TaskPriority;
  binIds: string[];
  primaryBinId: string;
  vehicleId?: string;
  crewId?: string;
  status: TaskStatus;
  createdBy: 'WasteOps Orchestrator' | 'Operations Agent' | 'Verification Agent' | 'Triage Agent' | 'Human Dispatcher' | string;
  createdAt: string;
  updatedAt: string;
  etaMinutes: number;
  estimatedDistanceKm: number;
  verificationStatus: 'NOT_STARTED' | 'PENDING_VERIFICATION' | 'SUCCESS' | 'FAILED';
  verificationDetails?: string;
  approvalRequired: boolean;
  approvalId?: string;
  routeStops?: Array<{ binId: string; lat: number; lng: number; address: string; fillLevel: number }>;
  justification?: string;
  assignedAt?: string;
  completedAt?: string;
}

export interface ApprovalRequest {
  id: string;
  taskId: string;
  binId: string;
  fillLevel: number;
  predictedOverflow: string;
  recommendedVehicleId: string;
  recommendedRoute: string[];
  estimatedResponseTimeMinutes: number;
  reason: string;
  urgency: TaskPriority;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  modificationNotes?: string;
}

export interface AgentActivityStep {
  id: string;
  timestamp: string;
  eventId?: string;
  agent: 'WasteOps Orchestrator' | 'Triage Agent' | 'Route Agent' | 'Operations Agent' | 'Verification Agent' | 'Memory Service';
  stage: 'PERCEPTION' | 'TRIAGE' | 'MEMORY' | 'ROUTING' | 'ACTION' | 'APPROVAL' | 'VERIFY' | 'LEARN';
  action: string;
  target?: string;
  inputSummary: string;
  reasoning: string;
  outputSummary: string;
  toolUsed?: string;
  toolArgs?: Record<string, any>;
  toolResult?: Record<string, any>;
  durationMs: number;
  severity?: SeverityLevel;
}

export interface AgentDecision {
  id: string;
  timestamp: string;
  agent: string;
  triggerEvent: string;
  actionTaken: string;
  targetId: string;
  result: 'SUCCESS' | 'FAILED' | 'PENDING_APPROVAL' | 'ESCALATED';
  requiresApproval: boolean;
  confidenceScore: number; // 0 to 1
  operationalImpact: string;
}

export interface OperationalMemory {
  id: string;
  category: 'RECURRING_OVERFLOW' | 'FLEET_PERFORMANCE' | 'COLLECTION_DURATION' | 'OPERATOR_DECISION' | 'SENSOR_RELIABILITY';
  targetKey: string; // e.g. BIN-104 or ZONE-DOWNTOWN or TRUCK-07
  content: string;
  severity: SeverityLevel;
  confidence: number;
  occurrenceCount: number;
  lastUpdated: string;
}

export interface DashboardMetrics {
  criticalBins: number;
  overflowRisk: number;
  activeTasks: number;
  pendingApprovals: number;
  completedToday: number;
  responseTimeSavedHours: number;
  autonomousDecisionPercent: number;
  humanApprovalPercent: number;
  executionSuccessRatePercent: number;
  averageDecisionLatencySec: number;
  estimatedWorkloadAvoidedHours: number;
}

export interface SystemStatus {
  mode: 'LOCAL_DEVELOPMENT' | 'GOOGLE_CLOUD';
  gemini: 'CONNECTED' | 'USING_FALLBACK_AI';
  firestore: 'CONNECTED' | 'LOCAL_ADAPTER';
  pubsub: 'CONNECTED' | 'LOCAL_EVENT_BUS';
  cloudRun: 'DEPLOYED_ENV' | 'DEV_CONTAINER';
  activeSimulation: boolean;
  demoModeRunning: boolean;
  demoStep?: number;
}
