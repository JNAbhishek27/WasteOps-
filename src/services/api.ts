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
} from '../types';

export const api = {
  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/system/status');
    return res.json();
  },

  async getBins(): Promise<Bin[]> {
    const res = await fetch('/api/bins');
    return res.json();
  },

  async getBin(id: string): Promise<Bin> {
    const res = await fetch(`/api/bins/${id}`);
    return res.json();
  },

  async updateBin(id: string, updates: Partial<Bin>): Promise<Bin> {
    const res = await fetch(`/api/bins/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch('/api/vehicles');
    return res.json();
  },

  async getCrews(): Promise<Crew[]> {
    const res = await fetch('/api/crews');
    return res.json();
  },

  async getTasks(status?: string): Promise<CollectionTask[]> {
    const url = status ? `/api/tasks?status=${status}` : '/api/tasks';
    const res = await fetch(url);
    return res.json();
  },

  async createTask(task: Partial<CollectionTask>): Promise<CollectionTask> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return res.json();
  },

  async approveTask(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/tasks/${id}/approve`, { method: 'POST' });
    return res.json();
  },

  async rejectTask(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/tasks/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  async completeTask(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/tasks/${id}/complete`, { method: 'POST' });
    return res.json();
  },

  async getApprovals(): Promise<ApprovalRequest[]> {
    const res = await fetch('/api/approvals');
    return res.json();
  },

  async decideApproval(
    id: string,
    decision: 'APPROVE' | 'REJECT' | 'MODIFY',
    modificationNotes?: string
  ): Promise<{ success: boolean; status: string }> {
    const res = await fetch(`/api/approvals/${id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, modificationNotes }),
    });
    return res.json();
  },

  async getEvents(): Promise<OperationalEvent[]> {
    const res = await fetch('/api/events');
    return res.json();
  },

  async publishEvent(event: Partial<OperationalEvent>): Promise<OperationalEvent> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.json();
  },

  async getActivity(): Promise<AgentActivityStep[]> {
    const res = await fetch('/api/agent/activity');
    return res.json();
  },

  async getDecisions(): Promise<AgentDecision[]> {
    const res = await fetch('/api/agent/decisions');
    return res.json();
  },

  async getMemories(targetKey?: string): Promise<OperationalMemory[]> {
    const url = targetKey ? `/api/agent/memories?targetKey=${encodeURIComponent(targetKey)}` : '/api/agent/memories';
    const res = await fetch(url);
    return res.json();
  },

  async sendAgentConsole(message: string): Promise<{ response: string; toolsInvoked?: string[] }> {
    const res = await fetch('/api/agent/console', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  async getAnalytics(): Promise<{
    metrics: DashboardMetrics;
    zoneStats: Record<string, { total: number; critical: number; healthy: number }>;
    hourlyTrends: Array<{ hour: string; incidents: number; resolved: number; latencySec: number }>;
    fleetCount: number;
    activeTasksCount: number;
    completedTasksCount: number;
  }> {
    const res = await fetch('/api/analytics');
    return res.json();
  },

  async runSimulationPreset(preset: string, payload?: any): Promise<any> {
    const res = await fetch('/api/simulate/preset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset, ...payload }),
    });
    return res.json();
  },

  async getDemoState(): Promise<any> {
    const res = await fetch('/api/simulate/demo-state');
    return res.json();
  },

  async triggerDemoStep(step?: number): Promise<any> {
    const res = await fetch('/api/simulate/demo-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step }),
    });
    return res.json();
  },

  async toggleLiveTicker(enable?: boolean): Promise<{ isRunning: boolean }> {
    const res = await fetch('/api/simulate/ticker-toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable }),
    });
    return res.json();
  },

  async resetData(): Promise<any> {
    const res = await fetch('/api/simulate/reset', { method: 'POST' });
    return res.json();
  },
};
