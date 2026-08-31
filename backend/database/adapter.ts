import {
  Bin,
  Vehicle,
  Crew,
  OperationalEvent,
  CollectionTask,
  ApprovalRequest,
  AgentActivityStep,
  AgentDecision,
  OperationalMemory,
  DashboardMetrics,
  SystemStatus,
} from '../models/types';

export interface IDatabaseAdapter {
  getBins(): Promise<Bin[]>;
  getBin(id: string): Promise<Bin | null>;
  updateBin(id: string, updates: Partial<Bin>): Promise<Bin | null>;
  
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | null>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null>;

  getCrews(): Promise<Crew[]>;
  getCrew(id: string): Promise<Crew | null>;

  getEvents(limit?: number): Promise<OperationalEvent[]>;
  addEvent(event: Omit<OperationalEvent, 'id' | 'timestamp' | 'processed'>): Promise<OperationalEvent>;
  markEventProcessed(id: string): Promise<void>;

  getTasks(filter?: { status?: string }): Promise<CollectionTask[]>;
  getTask(id: string): Promise<CollectionTask | null>;
  createTask(task: Omit<CollectionTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionTask>;
  updateTask(id: string, updates: Partial<CollectionTask>): Promise<CollectionTask | null>;

  getApprovals(): Promise<ApprovalRequest[]>;
  getApproval(id: string): Promise<ApprovalRequest | null>;
  createApproval(approval: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>): Promise<ApprovalRequest>;
  updateApproval(id: string, updates: Partial<ApprovalRequest>): Promise<ApprovalRequest | null>;

  getActivitySteps(limit?: number): Promise<AgentActivityStep[]>;
  addActivityStep(step: Omit<AgentActivityStep, 'id' | 'timestamp'>): Promise<AgentActivityStep>;

  getDecisions(limit?: number): Promise<AgentDecision[]>;
  addDecision(decision: Omit<AgentDecision, 'id' | 'timestamp'>): Promise<AgentDecision>;

  getMemories(targetKey?: string): Promise<OperationalMemory[]>;
  saveMemory(memory: Omit<OperationalMemory, 'id' | 'lastUpdated'>): Promise<OperationalMemory>;

  getMetrics(): Promise<DashboardMetrics>;
  resetToSeed(): Promise<void>;
}

const INITIAL_BINS: Bin[] = [
  {
    id: 'BIN-101',
    location: { lat: 37.7749, lng: -122.4194, address: 'Market St & 4th St', zone: 'Downtown Central' },
    fillLevel: 42,
    fillRatePerHour: 2.1,
    wasteType: 'mixed',
    status: 'HEALTHY',
    capacityLiters: 1100,
    lastCollection: '4 hours ago',
    predictedOverflowAt: 'in 28 hours',
    sensorBattery: 94,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Downtown Central',
    historicalOverflowCount: 3,
  },
  {
    id: 'BIN-102',
    location: { lat: 37.7762, lng: -122.4168, address: 'Mission St & 5th St', zone: 'Downtown Central' },
    fillLevel: 78,
    fillRatePerHour: 4.5,
    wasteType: 'recyclable',
    status: 'APPROACHING_CAPACITY',
    capacityLiters: 1100,
    lastCollection: '6 hours ago',
    predictedOverflowAt: 'in 4.8 hours',
    sensorBattery: 88,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Downtown Central',
    historicalOverflowCount: 5,
  },
  {
    id: 'BIN-103',
    location: { lat: 37.7731, lng: -122.4215, address: 'Howard St & 6th St', zone: 'Downtown Central' },
    fillLevel: 62,
    fillRatePerHour: 1.8,
    wasteType: 'organic',
    status: 'HEALTHY',
    capacityLiters: 800,
    lastCollection: '8 hours ago',
    predictedOverflowAt: 'in 21 hours',
    sensorBattery: 91,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Downtown Central',
    historicalOverflowCount: 2,
  },
  {
    id: 'BIN-104',
    location: { lat: 37.7785, lng: -122.4150, address: 'Powell St Station Plaza', zone: 'Downtown Central' },
    fillLevel: 94,
    fillRatePerHour: 7.2,
    wasteType: 'mixed',
    status: 'HIGH_RISK',
    capacityLiters: 1200,
    lastCollection: '11 hours ago',
    predictedOverflowAt: 'in 38 minutes',
    sensorBattery: 95,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Downtown Central',
    historicalOverflowCount: 14,
    notes: 'High foot traffic transit hub. Rapid weekend surges.',
  },
  {
    id: 'BIN-105',
    location: { lat: 37.7801, lng: -122.4120, address: 'Union Square South', zone: 'Downtown Central' },
    fillLevel: 86,
    fillRatePerHour: 5.0,
    wasteType: 'mixed',
    status: 'APPROACHING_CAPACITY',
    capacityLiters: 1100,
    lastCollection: '7 hours ago',
    predictedOverflowAt: 'in 2.8 hours',
    sensorBattery: 82,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Downtown Central',
    historicalOverflowCount: 8,
  },
  {
    id: 'BIN-106',
    location: { lat: 37.7820, lng: -122.4085, address: 'Post St & Kearny St', zone: 'Financial District' },
    fillLevel: 51,
    fillRatePerHour: 2.0,
    wasteType: 'recyclable',
    status: 'HEALTHY',
    capacityLiters: 1100,
    lastCollection: '5 hours ago',
    predictedOverflowAt: 'in 24 hours',
    sensorBattery: 98,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Financial District',
    historicalOverflowCount: 1,
  },
  {
    id: 'BIN-107',
    location: { lat: 37.7845, lng: -122.4042, address: 'Montgomery St Concourse', zone: 'Financial District' },
    fillLevel: 91,
    fillRatePerHour: 6.4,
    wasteType: 'mixed',
    status: 'CRITICAL_OVERFLOW',
    capacityLiters: 1100,
    lastCollection: '14 hours ago',
    predictedOverflowAt: 'in 42 minutes',
    sensorBattery: 79,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Financial District',
    historicalOverflowCount: 9,
  },
  {
    id: 'BIN-108',
    location: { lat: 37.7865, lng: -122.3995, address: 'Battery St & California', zone: 'Financial District' },
    fillLevel: 35,
    fillRatePerHour: 1.5,
    wasteType: 'electronic',
    status: 'HEALTHY',
    capacityLiters: 600,
    lastCollection: '1 day ago',
    predictedOverflowAt: 'in 43 hours',
    sensorBattery: 89,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Financial District',
    historicalOverflowCount: 0,
  },
  {
    id: 'BIN-109',
    location: { lat: 37.7890, lng: -122.3950, address: 'Embarcadero Ferry Terminal', zone: 'Waterfront North' },
    fillLevel: 96,
    fillRatePerHour: 8.5,
    wasteType: 'mixed',
    status: 'CRITICAL_OVERFLOW',
    capacityLiters: 1500,
    lastCollection: '12 hours ago',
    predictedOverflowAt: 'in 25 minutes',
    sensorBattery: 92,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Waterfront North',
    historicalOverflowCount: 19,
    notes: 'Touristy waterfront. Extreme mid-day spikes.',
  },
  {
    id: 'BIN-110',
    location: { lat: 37.7915, lng: -122.3980, address: 'Pier 7 Promenade', zone: 'Waterfront North' },
    fillLevel: 72,
    fillRatePerHour: 3.8,
    wasteType: 'organic',
    status: 'APPROACHING_CAPACITY',
    capacityLiters: 800,
    lastCollection: '5 hours ago',
    predictedOverflowAt: 'in 7.3 hours',
    sensorBattery: 75,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Waterfront North',
    historicalOverflowCount: 4,
  },
  {
    id: 'BIN-111',
    location: { lat: 37.7940, lng: -122.4010, address: 'Pier 15 Science Center', zone: 'Waterfront North' },
    fillLevel: 28,
    fillRatePerHour: 1.2,
    wasteType: 'recyclable',
    status: 'HEALTHY',
    capacityLiters: 1100,
    lastCollection: '3 hours ago',
    predictedOverflowAt: 'in 60 hours',
    sensorBattery: 96,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Waterfront North',
    historicalOverflowCount: 1,
  },
  {
    id: 'BIN-112',
    location: { lat: 37.7690, lng: -122.4460, address: 'Golden Gate Park Conservatory', zone: 'Metro Park West' },
    fillLevel: 89,
    fillRatePerHour: 5.6,
    wasteType: 'organic',
    status: 'HIGH_RISK',
    capacityLiters: 1200,
    lastCollection: '8 hours ago',
    predictedOverflowAt: 'in 1.9 hours',
    sensorBattery: 85,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Metro Park West',
    historicalOverflowCount: 11,
  },
  {
    id: 'BIN-113',
    location: { lat: 37.7675, lng: -122.4510, address: 'Botanical Garden Main Gate', zone: 'Metro Park West' },
    fillLevel: 64,
    fillRatePerHour: 2.7,
    wasteType: 'mixed',
    status: 'HEALTHY',
    capacityLiters: 1100,
    lastCollection: '6 hours ago',
    predictedOverflowAt: 'in 13.3 hours',
    sensorBattery: 90,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Metro Park West',
    historicalOverflowCount: 3,
  },
  {
    id: 'BIN-114',
    location: { lat: 37.7650, lng: -122.4560, address: 'Stow Lake Boathouse', zone: 'Metro Park West' },
    fillLevel: 98,
    fillRatePerHour: 6.9,
    wasteType: 'mixed',
    status: 'CRITICAL_OVERFLOW',
    capacityLiters: 1200,
    lastCollection: '15 hours ago',
    predictedOverflowAt: 'in 15 minutes',
    sensorBattery: 88,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Metro Park West',
    historicalOverflowCount: 12,
  },
  {
    id: 'BIN-115',
    location: { lat: 37.7630, lng: -122.4620, address: 'Spreckels Lake Pavilion', zone: 'Metro Park West' },
    fillLevel: 0,
    fillRatePerHour: 0,
    wasteType: 'hazardous',
    status: 'DAMAGED_SENSOR_FAIL',
    capacityLiters: 500,
    lastCollection: '2 days ago',
    predictedOverflowAt: 'UNKNOWN (Sensor Offline)',
    sensorBattery: 0,
    sensorHealthy: false,
    isDamaged: true,
    zone: 'Metro Park West',
    historicalOverflowCount: 4,
    notes: 'Lid actuator crushed by fallen branch. Telemetry lost.',
  },
  {
    id: 'BIN-116',
    location: { lat: 37.7580, lng: -122.4180, address: 'Mission Dolores Park North', zone: 'South Historic' },
    fillLevel: 93,
    fillRatePerHour: 7.8,
    wasteType: 'recyclable',
    status: 'HIGH_RISK',
    capacityLiters: 1500,
    lastCollection: '9 hours ago',
    predictedOverflowAt: 'in 54 minutes',
    sensorBattery: 84,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'South Historic',
    historicalOverflowCount: 16,
  },
  {
    id: 'BIN-117',
    location: { lat: 37.7550, lng: -122.4200, address: 'Valencia St & 18th St', zone: 'South Historic' },
    fillLevel: 82,
    fillRatePerHour: 4.2,
    wasteType: 'organic',
    status: 'APPROACHING_CAPACITY',
    capacityLiters: 800,
    lastCollection: '7 hours ago',
    predictedOverflowAt: 'in 4.2 hours',
    sensorBattery: 77,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'South Historic',
    historicalOverflowCount: 7,
  },
  {
    id: 'BIN-118',
    location: { lat: 37.7520, lng: -122.4160, address: '24th St Bart Plaza', zone: 'South Historic' },
    fillLevel: 49,
    fillRatePerHour: 2.3,
    wasteType: 'mixed',
    status: 'HEALTHY',
    capacityLiters: 1100,
    lastCollection: '4 hours ago',
    predictedOverflowAt: 'in 22 hours',
    sensorBattery: 92,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'South Historic',
    historicalOverflowCount: 2,
  },
  {
    id: 'BIN-119',
    location: { lat: 37.7490, lng: -122.4130, address: 'Potrero Ave Medical Center', zone: 'South Historic' },
    fillLevel: 95,
    fillRatePerHour: 6.1,
    wasteType: 'hazardous',
    status: 'CRITICAL_OVERFLOW',
    capacityLiters: 700,
    lastCollection: '13 hours ago',
    predictedOverflowAt: 'in 45 minutes',
    sensorBattery: 96,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'South Historic',
    historicalOverflowCount: 8,
  },
  {
    id: 'BIN-120',
    location: { lat: 37.7450, lng: -122.3920, address: 'Industrial Pier 92 Hub', zone: 'Industrial Harbor' },
    fillLevel: 33,
    fillRatePerHour: 1.1,
    wasteType: 'mixed',
    status: 'HEALTHY',
    capacityLiters: 2000,
    lastCollection: '1 day ago',
    predictedOverflowAt: 'in 60 hours',
    sensorBattery: 91,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Industrial Harbor',
    historicalOverflowCount: 1,
  },
  {
    id: 'BIN-121',
    location: { lat: 37.7420, lng: -122.3880, address: 'Cargo Way Logistics Bay', zone: 'Industrial Harbor' },
    fillLevel: 75,
    fillRatePerHour: 3.9,
    wasteType: 'recyclable',
    status: 'APPROACHING_CAPACITY',
    capacityLiters: 2400,
    lastCollection: '10 hours ago',
    predictedOverflowAt: 'in 6.4 hours',
    sensorBattery: 86,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Industrial Harbor',
    historicalOverflowCount: 3,
  },
  {
    id: 'BIN-122',
    location: { lat: 37.7390, lng: -122.3840, address: 'Evans Ave Eco Recovery Center', zone: 'Industrial Harbor' },
    fillLevel: 92,
    fillRatePerHour: 5.8,
    wasteType: 'hazardous',
    status: 'CRITICAL_OVERFLOW',
    capacityLiters: 1200,
    lastCollection: '16 hours ago',
    predictedOverflowAt: 'in 1.3 hours',
    sensorBattery: 89,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Industrial Harbor',
    historicalOverflowCount: 6,
  },
  {
    id: 'BIN-123',
    location: { lat: 37.7720, lng: -122.4040, address: 'Oracle Park Pavilion East', zone: 'Bayfront Stadium' },
    fillLevel: 88,
    fillRatePerHour: 6.7,
    wasteType: 'mixed',
    status: 'HIGH_RISK',
    capacityLiters: 1800,
    lastCollection: '8 hours ago',
    predictedOverflowAt: 'in 1.7 hours',
    sensorBattery: 95,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Bayfront Stadium',
    historicalOverflowCount: 15,
  },
  {
    id: 'BIN-124',
    location: { lat: 37.7680, lng: -122.3950, address: 'Chase Center South Plaza', zone: 'Bayfront Stadium' },
    fillLevel: 44,
    fillRatePerHour: 2.2,
    wasteType: 'recyclable',
    status: 'HEALTHY',
    capacityLiters: 1800,
    lastCollection: '4 hours ago',
    predictedOverflowAt: 'in 25 hours',
    sensorBattery: 93,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Bayfront Stadium',
    historicalOverflowCount: 4,
  },
  {
    id: 'BIN-125',
    location: { lat: 37.7650, lng: -122.3910, address: 'Mission Rock Waterfront', zone: 'Bayfront Stadium' },
    fillLevel: 67,
    fillRatePerHour: 3.1,
    wasteType: 'organic',
    status: 'HEALTHY',
    capacityLiters: 1100,
    lastCollection: '6 hours ago',
    predictedOverflowAt: 'in 10.6 hours',
    sensorBattery: 88,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Bayfront Stadium',
    historicalOverflowCount: 2,
  },
  {
    id: 'BIN-126',
    location: { lat: 37.7880, lng: -122.4220, address: 'Van Ness & Geary Blvd', zone: 'North Residential' },
    fillLevel: 56,
    fillRatePerHour: 2.4,
    wasteType: 'mixed',
    status: 'HEALTHY',
    capacityLiters: 1100,
    lastCollection: '5 hours ago',
    predictedOverflowAt: 'in 18 hours',
    sensorBattery: 91,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'North Residential',
    historicalOverflowCount: 2,
  },
  {
    id: 'BIN-127',
    location: { lat: 37.7940, lng: -122.4280, address: 'Lombard St Curve', zone: 'North Residential' },
    fillLevel: 97,
    fillRatePerHour: 7.9,
    wasteType: 'mixed',
    status: 'CRITICAL_OVERFLOW',
    capacityLiters: 1100,
    lastCollection: '12 hours ago',
    predictedOverflowAt: 'in 20 minutes',
    sensorBattery: 86,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'North Residential',
    historicalOverflowCount: 18,
  },
  {
    id: 'BIN-128',
    location: { lat: 37.7990, lng: -122.4340, address: 'Marina Green Boulevard', zone: 'North Residential' },
    fillLevel: 81,
    fillRatePerHour: 4.1,
    wasteType: 'recyclable',
    status: 'APPROACHING_CAPACITY',
    capacityLiters: 1200,
    lastCollection: '7 hours ago',
    predictedOverflowAt: 'in 4.6 hours',
    sensorBattery: 94,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'North Residential',
    historicalOverflowCount: 5,
  },
  {
    id: 'BIN-129',
    location: { lat: 37.7700, lng: -122.4700, address: 'Ocean Beach Esplanade', zone: 'Pacific Coastal' },
    fillLevel: 85,
    fillRatePerHour: 4.8,
    wasteType: 'mixed',
    status: 'APPROACHING_CAPACITY',
    capacityLiters: 1500,
    lastCollection: '9 hours ago',
    predictedOverflowAt: 'in 3.1 hours',
    sensorBattery: 79,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Pacific Coastal',
    historicalOverflowCount: 8,
  },
  {
    id: 'BIN-130',
    location: { lat: 37.7620, lng: -122.4780, address: 'Sunset Blvd & 36th Ave', zone: 'Pacific Coastal' },
    fillLevel: 39,
    fillRatePerHour: 1.6,
    wasteType: 'organic',
    status: 'HEALTHY',
    capacityLiters: 1100,
    lastCollection: '4 hours ago',
    predictedOverflowAt: 'in 38 hours',
    sensorBattery: 97,
    sensorHealthy: true,
    isDamaged: false,
    zone: 'Pacific Coastal',
    historicalOverflowCount: 1,
  },
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'TRUCK-01',
    name: 'Apollo Compactor 01',
    type: 'compactor_truck',
    capacityKg: 8500,
    currentLoadKg: 2100,
    status: 'AVAILABLE',
    currentLocation: { lat: 37.7750, lng: -122.4180, address: 'Central Depot 1', zone: 'Downtown Central' },
    assignedCrewId: 'CREW-ALPHA',
    assignedTaskIds: [],
    fuelOrBatteryLevel: 88,
    speedKmh: 35,
    zone: 'Downtown Central',
  },
  {
    id: 'TRUCK-02',
    name: 'Titan Heavy Hauler 02',
    type: 'compactor_truck',
    capacityKg: 10000,
    currentLoadKg: 7800,
    status: 'COLLECTING',
    currentLocation: { lat: 37.7850, lng: -122.4050, address: 'Financial Sector Route', zone: 'Financial District' },
    assignedCrewId: 'CREW-BRAVO',
    assignedTaskIds: ['WT-0994'],
    fuelOrBatteryLevel: 62,
    speedKmh: 28,
    zone: 'Financial District',
  },
  {
    id: 'TRUCK-03',
    name: 'EcoVolt Electric 03',
    type: 'electric_hauler',
    capacityKg: 5000,
    currentLoadKg: 1200,
    status: 'AVAILABLE',
    currentLocation: { lat: 37.7680, lng: -122.4450, address: 'Golden Gate Depot', zone: 'Metro Park West' },
    assignedCrewId: 'CREW-CHARLIE',
    assignedTaskIds: [],
    fuelOrBatteryLevel: 94,
    speedKmh: 40,
    zone: 'Metro Park West',
  },
  {
    id: 'TRUCK-04',
    name: 'SideLoader Pro 04',
    type: 'side_loader',
    capacityKg: 7000,
    currentLoadKg: 4500,
    status: 'EN_ROUTE',
    currentLocation: { lat: 37.7560, lng: -122.4190, address: 'Mission Transit Link', zone: 'South Historic' },
    assignedCrewId: 'CREW-DELTA',
    assignedTaskIds: ['WT-0997'],
    fuelOrBatteryLevel: 71,
    speedKmh: 32,
    zone: 'South Historic',
  },
  {
    id: 'TRUCK-05',
    name: 'MiniCollector Urban 05',
    type: 'mini_collector',
    capacityKg: 3000,
    currentLoadKg: 400,
    status: 'AVAILABLE',
    currentLocation: { lat: 37.7900, lng: -122.3970, address: 'Embarcadero Station', zone: 'Waterfront North' },
    assignedCrewId: 'CREW-ECHO',
    assignedTaskIds: [],
    fuelOrBatteryLevel: 85,
    speedKmh: 45,
    zone: 'Waterfront North',
  },
  {
    id: 'TRUCK-06',
    name: 'Hazard Recovery Unit 06',
    type: 'electric_hauler',
    capacityKg: 4000,
    currentLoadKg: 900,
    status: 'AVAILABLE',
    currentLocation: { lat: 37.7400, lng: -122.3860, address: 'Eco Hazard Facility', zone: 'Industrial Harbor' },
    assignedCrewId: 'CREW-FOXTROT',
    assignedTaskIds: [],
    fuelOrBatteryLevel: 91,
    speedKmh: 38,
    zone: 'Industrial Harbor',
  },
  {
    id: 'TRUCK-07',
    name: 'Rapid Response Compactor 07',
    type: 'compactor_truck',
    capacityKg: 8500,
    currentLoadKg: 850,
    status: 'AVAILABLE',
    currentLocation: { lat: 37.7770, lng: -122.4170, address: 'Market St Fast Response Base', zone: 'Downtown Central' },
    assignedCrewId: 'CREW-GOLF',
    assignedTaskIds: [],
    fuelOrBatteryLevel: 97,
    speedKmh: 42,
    zone: 'Downtown Central',
  },
  {
    id: 'TRUCK-08',
    name: 'Heavy Duty Hauler 08',
    type: 'compactor_truck',
    capacityKg: 12000,
    currentLoadKg: 0,
    status: 'MAINTENANCE',
    currentLocation: { lat: 37.7350, lng: -122.3900, address: 'Municipal Fleet Repair Bay', zone: 'Industrial Harbor' },
    assignedCrewId: undefined,
    assignedTaskIds: [],
    fuelOrBatteryLevel: 30,
    speedKmh: 0,
    zone: 'Industrial Harbor',
  },
];

const INITIAL_CREWS: Crew[] = [
  { id: 'CREW-ALPHA', name: 'Alpha Strike Team', lead: 'Marcus Vance', membersCount: 3, phone: '555-0192', shift: 'MORNING', assignedVehicleId: 'TRUCK-01', status: 'ACTIVE' },
  { id: 'CREW-BRAVO', name: 'Bravo Commercial', lead: 'Elena Rostova', membersCount: 3, phone: '555-0193', shift: 'MORNING', assignedVehicleId: 'TRUCK-02', status: 'ACTIVE' },
  { id: 'CREW-CHARLIE', name: 'Charlie Green Squad', lead: 'David Kim', membersCount: 2, phone: '555-0194', shift: 'MORNING', assignedVehicleId: 'TRUCK-03', status: 'ACTIVE' },
  { id: 'CREW-DELTA', name: 'Delta Rapid Response', lead: 'Maya Patel', membersCount: 2, phone: '555-0195', shift: 'AFTERNOON', assignedVehicleId: 'TRUCK-04', status: 'ACTIVE' },
  { id: 'CREW-ECHO', name: 'Echo Waterfront Unit', lead: 'Julian Rossi', membersCount: 2, phone: '555-0196', shift: 'AFTERNOON', assignedVehicleId: 'TRUCK-05', status: 'ACTIVE' },
  { id: 'CREW-FOXTROT', name: 'Foxtrot HazMat Team', lead: 'Sarah Chen', membersCount: 3, phone: '555-0197', shift: 'MORNING', assignedVehicleId: 'TRUCK-06', status: 'ACTIVE' },
  { id: 'CREW-GOLF', name: 'Golf Urgent Dispatch', lead: 'Andre Dubois', membersCount: 3, phone: '555-0198', shift: 'MORNING', assignedVehicleId: 'TRUCK-07', status: 'ACTIVE' },
  { id: 'CREW-HOTEL', name: 'Hotel Night Guard', lead: 'Carlos Santana', membersCount: 2, phone: '555-0199', shift: 'NIGHT', assignedVehicleId: undefined, status: 'OFF_DUTY' },
];

const INITIAL_TASKS: CollectionTask[] = [
  {
    id: 'WT-0994',
    type: 'ROUTINE_COLLECTION',
    priority: 'HIGH',
    binIds: ['BIN-107'],
    primaryBinId: 'BIN-107',
    vehicleId: 'TRUCK-02',
    crewId: 'CREW-BRAVO',
    status: 'ACTIVE',
    createdBy: 'WasteOps Orchestrator',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    etaMinutes: 12,
    estimatedDistanceKm: 3.4,
    verificationStatus: 'PENDING_VERIFICATION',
    approvalRequired: false,
    justification: 'Automated routine pickup scheduled for Financial District corridor before morning rush.',
  },
  {
    id: 'WT-0997',
    type: 'URGENT_COLLECTION',
    priority: 'HIGH',
    binIds: ['BIN-116', 'BIN-117'],
    primaryBinId: 'BIN-116',
    vehicleId: 'TRUCK-04',
    crewId: 'CREW-DELTA',
    status: 'ACTIVE',
    createdBy: 'Operations Agent',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    etaMinutes: 18,
    estimatedDistanceKm: 4.8,
    verificationStatus: 'PENDING_VERIFICATION',
    approvalRequired: true,
    justification: 'Mission Dolores park sunny weekend surge detected by multi-agent triage.',
  },
  {
    id: 'WT-0990',
    type: 'ROUTINE_COLLECTION',
    priority: 'MEDIUM',
    binIds: ['BIN-101', 'BIN-103'],
    primaryBinId: 'BIN-101',
    vehicleId: 'TRUCK-01',
    crewId: 'CREW-ALPHA',
    status: 'COMPLETED',
    createdBy: 'WasteOps Orchestrator',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    etaMinutes: 0,
    estimatedDistanceKm: 2.1,
    verificationStatus: 'SUCCESS',
    verificationDetails: 'Fill level dropped from 91% to 12%. Telemetry verified.',
    approvalRequired: false,
    justification: 'Completed regular morning route.',
  },
  {
    id: 'WT-0988',
    type: 'SENSOR_MAINTENANCE',
    priority: 'HIGH',
    binIds: ['BIN-115'],
    primaryBinId: 'BIN-115',
    status: 'PENDING',
    createdBy: 'Operations Agent',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    etaMinutes: 60,
    estimatedDistanceKm: 8.2,
    verificationStatus: 'NOT_STARTED',
    approvalRequired: false,
    justification: 'Hardware team dispatched for crushed actuator lid replacement.',
  },
];

const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'APP-104',
    taskId: 'WT-1042',
    binId: 'BIN-104',
    fillLevel: 94,
    predictedOverflow: 'in 38 minutes',
    recommendedVehicleId: 'TRUCK-07',
    recommendedRoute: ['BIN-104', 'BIN-105'],
    estimatedResponseTimeMinutes: 14,
    reason: 'BIN-104 (Powell St Station) is at 94% with rapid 7.2%/hr fill rate. Urgent high-capacity compactor dispatch required before transit rush.',
    urgency: 'CRITICAL',
    status: 'PENDING',
    requestedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'APP-109',
    taskId: 'WT-1043',
    binId: 'BIN-109',
    fillLevel: 96,
    predictedOverflow: 'in 25 minutes',
    recommendedVehicleId: 'TRUCK-05',
    recommendedRoute: ['BIN-109', 'BIN-110'],
    estimatedResponseTimeMinutes: 11,
    reason: 'BIN-109 (Ferry Terminal) reached critical 96% threshold with 8.5%/hr influx. Rapid response mini-collector rerouted.',
    urgency: 'CRITICAL',
    status: 'PENDING',
    requestedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
];

const INITIAL_MEMORIES: OperationalMemory[] = [
  {
    id: 'MEM-001',
    category: 'RECURRING_OVERFLOW',
    targetKey: 'BIN-104',
    content: 'BIN-104 at Powell Station frequently surges past 90% on Friday/Saturday between 11:00 and 15:00. Pre-emptive collections reduce emergency dispatches by 64%.',
    severity: 'HIGH',
    confidence: 0.94,
    occurrenceCount: 14,
    lastUpdated: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'MEM-002',
    category: 'RECURRING_OVERFLOW',
    targetKey: 'BIN-109',
    content: 'BIN-109 Embarcadero Ferry Terminal exhibits sharp tourist lunch spikes. MiniCollector Urban 05 has best navigation clearance on the promenade.',
    severity: 'CRITICAL',
    confidence: 0.96,
    occurrenceCount: 19,
    lastUpdated: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'MEM-003',
    category: 'FLEET_PERFORMANCE',
    targetKey: 'TRUCK-07',
    content: 'TRUCK-07 Rapid Response Compactor has shortest average response time in Downtown Central (14.2 min) with 98% on-time verification.',
    severity: 'LOW',
    confidence: 0.98,
    occurrenceCount: 42,
    lastUpdated: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'MEM-004',
    category: 'OPERATOR_DECISION',
    targetKey: 'ZONE-DOWNTOWN',
    content: 'Operations Manager consistently approves multi-bin clustering when adjacent bins exceed 75% capacity to minimize transit fuel costs.',
    severity: 'MEDIUM',
    confidence: 0.89,
    occurrenceCount: 27,
    lastUpdated: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'MEM-005',
    category: 'SENSOR_RELIABILITY',
    targetKey: 'BIN-115',
    content: 'BIN-115 ultrasonic sensor showed 3 intermittency alerts prior to physical damage failure. Flag for preventive maintenance on similar generation bins.',
    severity: 'HIGH',
    confidence: 0.91,
    occurrenceCount: 4,
    lastUpdated: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_ACTIVITY: AgentActivityStep[] = [
  {
    id: 'ACT-001',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    agent: 'WasteOps Orchestrator',
    stage: 'PERCEPTION',
    action: 'INGEST_TELEMETRY_STREAM',
    target: 'ALL_BINS',
    inputSummary: 'Ingested real-time smart-bin sensor batch across 30 municipal nodes.',
    reasoning: 'Continuous monitoring loop detected fill rate spikes in Downtown Central & Waterfront North.',
    outputSummary: 'Flagged 7 critical/high-risk bins for automated specialist triage.',
    durationMs: 42,
    severity: 'MEDIUM',
  },
  {
    id: 'ACT-002',
    timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
    agent: 'Triage Agent',
    stage: 'TRIAGE',
    action: 'CLASSIFY_SEVERITY',
    target: 'BIN-104',
    inputSummary: 'BIN-104 fillLevel=94%, fillRate=7.2%/hr, predictedOverflow=38min.',
    reasoning: 'Severe risk of immediate overflow in high pedestrian density hub. Exceeds 90% threshold and has high historic surge index.',
    outputSummary: 'Classified incident as CRITICAL. Recommended immediate compactor dispatch.',
    toolUsed: 'get_bin_status',
    toolArgs: { binId: 'BIN-104' },
    toolResult: { fillLevel: 94, rate: 7.2, status: 'HIGH_RISK' },
    durationMs: 110,
    severity: 'CRITICAL',
  },
  {
    id: 'ACT-003',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    agent: 'Memory Service',
    stage: 'MEMORY',
    action: 'RETRIEVE_OPERATIONAL_MEMORY',
    target: 'BIN-104',
    inputSummary: 'Queried operational memory for target BIN-104 and zone Downtown Central.',
    reasoning: 'Checked past incident logs to evaluate whether pre-emptive clustering with BIN-105 is beneficial.',
    outputSummary: 'Found MEM-001 (14 past surges) and MEM-003 (TRUCK-07 top performance).',
    toolUsed: 'get_operational_history',
    toolArgs: { targetKey: 'BIN-104' },
    toolResult: { matches: 2, confidence: 0.94 },
    durationMs: 65,
    severity: 'LOW',
  },
  {
    id: 'ACT-004',
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    agent: 'Route Agent',
    stage: 'ROUTING',
    action: 'OPTIMIZE_COLLECTION_ROUTE',
    target: 'TRUCK-07',
    inputSummary: 'Evaluated 8 fleet vehicles for proximity, capacity (8500kg), and current availability.',
    reasoning: 'TRUCK-07 is 1.2km away with 7650kg spare capacity. Clustered BIN-104 (94%) with nearby BIN-105 (86%).',
    outputSummary: 'Generated 2-stop route: Depot -> BIN-104 -> BIN-105 -> Eco Hub. ETA: 14 min, Distance: 3.2km.',
    toolUsed: 'optimize_route',
    toolArgs: { binIds: ['BIN-104', 'BIN-105'], vehicleId: 'TRUCK-07' },
    toolResult: { selectedVehicle: 'TRUCK-07', etaMinutes: 14, distanceKm: 3.2 },
    durationMs: 145,
    severity: 'MEDIUM',
  },
  {
    id: 'ACT-005',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    agent: 'Operations Agent',
    stage: 'APPROVAL',
    action: 'REQUEST_HUMAN_APPROVAL',
    target: 'WT-1042',
    inputSummary: 'Prepared collection task WT-1042 with vehicle TRUCK-07 and crew Golf.',
    reasoning: 'Critical severity event in Downtown zone with estimated cost impact requires manager sign-off per safety policy.',
    outputSummary: 'Created Approval Request APP-104 for Operations Manager review in Approval Center.',
    toolUsed: 'request_human_approval',
    toolArgs: { binId: 'BIN-104', taskId: 'WT-1042', recommendedVehicle: 'TRUCK-07' },
    toolResult: { approvalId: 'APP-104', status: 'PENDING' },
    durationMs: 88,
    severity: 'HIGH',
  },
];

const INITIAL_DECISIONS: AgentDecision[] = [
  {
    id: 'DEC-001',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    agent: 'WasteOps Orchestrator',
    triggerEvent: 'BIN_REACHED_94_PERCENT',
    actionTaken: 'CREATE_COLLECTION_TASK_AND_REQUEST_APPROVAL',
    targetId: 'BIN-104',
    result: 'PENDING_APPROVAL',
    requiresApproval: true,
    confidenceScore: 0.96,
    operationalImpact: 'Prevents sidewalk overflow at city central transit hub during rush hour.',
  },
  {
    id: 'DEC-002',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    agent: 'Operations Agent',
    triggerEvent: 'SCHEDULED_ROUTINE_CYCLE',
    actionTaken: 'AUTONOMOUS_TASK_DISPATCH',
    targetId: 'BIN-101',
    result: 'SUCCESS',
    requiresApproval: false,
    confidenceScore: 0.99,
    operationalImpact: 'Routine autonomous collection executed with zero human intervention.',
  },
];

export class LocalDatabaseAdapter implements IDatabaseAdapter {
  private bins: Bin[] = JSON.parse(JSON.stringify(INITIAL_BINS));
  private vehicles: Vehicle[] = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
  private crews: Crew[] = JSON.parse(JSON.stringify(INITIAL_CREWS));
  private events: OperationalEvent[] = [];
  private tasks: CollectionTask[] = JSON.parse(JSON.stringify(INITIAL_TASKS));
  private approvals: ApprovalRequest[] = JSON.parse(JSON.stringify(INITIAL_APPROVALS));
  private activitySteps: AgentActivityStep[] = JSON.parse(JSON.stringify(INITIAL_ACTIVITY));
  private decisions: AgentDecision[] = JSON.parse(JSON.stringify(INITIAL_DECISIONS));
  private memories: OperationalMemory[] = JSON.parse(JSON.stringify(INITIAL_MEMORIES));

  async getBins(): Promise<Bin[]> {
    return [...this.bins];
  }

  async getBin(id: string): Promise<Bin | null> {
    const bin = this.bins.find((b) => b.id.toUpperCase() === id.toUpperCase());
    return bin ? { ...bin } : null;
  }

  async updateBin(id: string, updates: Partial<Bin>): Promise<Bin | null> {
    const index = this.bins.findIndex((b) => b.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;
    
    // Auto-update status based on fillLevel if not explicitly provided
    if (updates.fillLevel !== undefined && !updates.status) {
      if (updates.fillLevel >= 90) updates.status = 'CRITICAL_OVERFLOW';
      else if (updates.fillLevel >= 80) updates.status = 'HIGH_RISK';
      else if (updates.fillLevel >= 70) updates.status = 'APPROACHING_CAPACITY';
      else updates.status = 'HEALTHY';
    }

    this.bins[index] = { ...this.bins[index], ...updates };
    return { ...this.bins[index] };
  }

  async getVehicles(): Promise<Vehicle[]> {
    return [...this.vehicles];
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    const v = this.vehicles.find((item) => item.id.toUpperCase() === id.toUpperCase());
    return v ? { ...v } : null;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    const index = this.vehicles.findIndex((v) => v.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;
    this.vehicles[index] = { ...this.vehicles[index], ...updates };
    return { ...this.vehicles[index] };
  }

  async getCrews(): Promise<Crew[]> {
    return [...this.crews];
  }

  async getCrew(id: string): Promise<Crew | null> {
    const c = this.crews.find((item) => item.id.toUpperCase() === id.toUpperCase());
    return c ? { ...c } : null;
  }

  async getEvents(limit = 50): Promise<OperationalEvent[]> {
    return this.events.slice(-limit).reverse();
  }

  async addEvent(eventData: Omit<OperationalEvent, 'id' | 'timestamp' | 'processed'>): Promise<OperationalEvent> {
    const newEvent: OperationalEvent = {
      id: `EVT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      processed: false,
      ...eventData,
    };
    this.events.push(newEvent);
    return newEvent;
  }

  async markEventProcessed(id: string): Promise<void> {
    const event = this.events.find((e) => e.id === id);
    if (event) {
      event.processed = true;
      event.processedAt = new Date().toISOString();
    }
  }

  async getTasks(filter?: { status?: string }): Promise<CollectionTask[]> {
    let list = [...this.tasks];
    if (filter?.status) {
      list = list.filter((t) => t.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTask(id: string): Promise<CollectionTask | null> {
    const t = this.tasks.find((task) => task.id.toUpperCase() === id.toUpperCase());
    return t ? { ...t } : null;
  }

  async createTask(taskData: Omit<CollectionTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionTask> {
    const now = new Date().toISOString();
    const newTask: CollectionTask = {
      id: `WT-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: now,
      updatedAt: now,
      ...taskData,
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<CollectionTask>): Promise<CollectionTask | null> {
    const index = this.tasks.findIndex((t) => t.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.tasks[index] };
  }

  async getApprovals(): Promise<ApprovalRequest[]> {
    return [...this.approvals].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  async getApproval(id: string): Promise<ApprovalRequest | null> {
    const app = this.approvals.find((a) => a.id.toUpperCase() === id.toUpperCase());
    return app ? { ...app } : null;
  }

  async createApproval(approvalData: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>): Promise<ApprovalRequest> {
    const newApproval: ApprovalRequest = {
      id: `APP-${Math.floor(100 + Math.random() * 900)}`,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
      ...approvalData,
    };
    this.approvals.unshift(newApproval);
    return newApproval;
  }

  async updateApproval(id: string, updates: Partial<ApprovalRequest>): Promise<ApprovalRequest | null> {
    const index = this.approvals.findIndex((a) => a.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;
    this.approvals[index] = { ...this.approvals[index], ...updates };
    return { ...this.approvals[index] };
  }

  async getActivitySteps(limit = 60): Promise<AgentActivityStep[]> {
    return this.activitySteps.slice(0, limit);
  }

  async addActivityStep(stepData: Omit<AgentActivityStep, 'id' | 'timestamp'>): Promise<AgentActivityStep> {
    const newStep: AgentActivityStep = {
      id: `ACT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
      timestamp: new Date().toISOString(),
      ...stepData,
    };
    this.activitySteps.unshift(newStep);
    if (this.activitySteps.length > 200) {
      this.activitySteps = this.activitySteps.slice(0, 200);
    }
    return newStep;
  }

  async getDecisions(limit = 40): Promise<AgentDecision[]> {
    return this.decisions.slice(0, limit);
  }

  async addDecision(decisionData: Omit<AgentDecision, 'id' | 'timestamp'>): Promise<AgentDecision> {
    const newDecision: AgentDecision = {
      id: `DEC-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      ...decisionData,
    };
    this.decisions.unshift(newDecision);
    return newDecision;
  }

  async getMemories(targetKey?: string): Promise<OperationalMemory[]> {
    if (targetKey) {
      return this.memories.filter((m) => m.targetKey.toUpperCase().includes(targetKey.toUpperCase()));
    }
    return [...this.memories];
  }

  async saveMemory(memoryData: Omit<OperationalMemory, 'id' | 'lastUpdated'>): Promise<OperationalMemory> {
    const existingIndex = this.memories.findIndex(
      (m) => m.targetKey.toUpperCase() === memoryData.targetKey.toUpperCase() && m.category === memoryData.category
    );

    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      this.memories[existingIndex] = {
        ...this.memories[existingIndex],
        ...memoryData,
        occurrenceCount: this.memories[existingIndex].occurrenceCount + 1,
        lastUpdated: now,
      };
      return this.memories[existingIndex];
    } else {
      const newMemory: OperationalMemory = {
        id: `MEM-${Math.floor(100 + Math.random() * 900)}`,
        lastUpdated: now,
        ...memoryData,
      };
      this.memories.unshift(newMemory);
      return newMemory;
    }
  }

  async getMetrics(): Promise<DashboardMetrics> {
    const criticalBins = this.bins.filter((b) => b.status === 'CRITICAL_OVERFLOW' || b.fillLevel >= 90).length;
    const overflowRisk = this.bins.filter((b) => b.status === 'HIGH_RISK' || (b.fillLevel >= 80 && b.fillLevel < 90)).length;
    const activeTasks = this.tasks.filter((t) => t.status === 'ACTIVE' || t.status === 'APPROVED').length;
    const pendingApprovals = this.approvals.filter((a) => a.status === 'PENDING').length;
    const completedToday = this.tasks.filter((t) => t.status === 'COMPLETED').length + 24; // realistic offset for today

    return {
      criticalBins,
      overflowRisk,
      activeTasks,
      pendingApprovals,
      completedToday,
      responseTimeSavedHours: 5.4,
      autonomousDecisionPercent: 84,
      humanApprovalPercent: 16,
      executionSuccessRatePercent: 97.5,
      averageDecisionLatencySec: 1.8,
      estimatedWorkloadAvoidedHours: 36.2,
    };
  }

  async resetToSeed(): Promise<void> {
    this.bins = JSON.parse(JSON.stringify(INITIAL_BINS));
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    this.crews = JSON.parse(JSON.stringify(INITIAL_CREWS));
    this.events = [];
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.approvals = JSON.parse(JSON.stringify(INITIAL_APPROVALS));
    this.activitySteps = JSON.parse(JSON.stringify(INITIAL_ACTIVITY));
    this.decisions = JSON.parse(JSON.stringify(INITIAL_DECISIONS));
    this.memories = JSON.parse(JSON.stringify(INITIAL_MEMORIES));
  }
}

// Global Singleton Database Instance
export const db = new LocalDatabaseAdapter();
