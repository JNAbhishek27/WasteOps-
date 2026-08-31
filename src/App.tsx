import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { OperationsDashboard } from './components/OperationsDashboard';
import { LiveOperationsMap } from './components/LiveOperationsMap';
import { AgentActivityView } from './components/AgentActivityView';
import { TaskManagement } from './components/TaskManagement';
import { ApprovalCenter } from './components/ApprovalCenter';
import { AnalyticsView } from './components/AnalyticsView';
import { DataSimulatorView } from './components/DataSimulatorView';
import { ArchitectureView } from './components/ArchitectureView';
import { AgentConsoleDrawer } from './components/AgentConsoleDrawer';
import { CloudStatusModal } from './components/CloudStatusModal';
import { api } from './services/api';
import {
  Bin,
  Vehicle,
  CollectionTask,
  ApprovalRequest,
  AgentActivityStep,
  AgentDecision,
  DashboardMetrics,
  SystemStatus,
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('operations');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [bins, setBins] = useState<Bin[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [activitySteps, setActivitySteps] = useState<AgentActivityStep[]>([]);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [demoState, setDemoState] = useState<any>(null);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [isTickerRunning, setIsTickerRunning] = useState<boolean>(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isCloudStatusOpen, setIsCloudStatusOpen] = useState<boolean>(false);

  // Data Fetching Function
  const fetchAllData = useCallback(async () => {
    try {
      const [
        statusRes,
        binsRes,
        vehiclesRes,
        tasksRes,
        approvalsRes,
        activityRes,
        decisionsRes,
        analyticsRes,
        demoRes,
      ] = await Promise.all([
        api.getSystemStatus(),
        api.getBins(),
        api.getVehicles(),
        api.getTasks(),
        api.getApprovals(),
        api.getActivity(),
        api.getDecisions(),
        api.getAnalytics(),
        api.getDemoState(),
      ]);

      setSystemStatus(statusRes);
      setBins(binsRes);
      setVehicles(vehiclesRes);
      setTasks(tasksRes);
      setApprovals(approvalsRes);
      setActivitySteps(activityRes);
      setDecisions(decisionsRes);
      setAnalyticsData(analyticsRes);
      setMetrics(analyticsRes?.metrics || null);
      setDemoState(demoRes);
      setIsTickerRunning(statusRes?.activeSimulation || false);

      // Keep selected bin up to date with fresh telemetry
      if (selectedBin) {
        const refreshedSelected = binsRes.find((b) => b.id === selectedBin.id);
        if (refreshedSelected) setSelectedBin(refreshedSelected);
      }
    } catch (err) {
      console.error('[WasteOps] Error refreshing operational state:', err);
    }
  }, [selectedBin]);

  // Polling loop every 3 seconds
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Handlers
  const handleApproveTask = async (taskId: string) => {
    await api.approveTask(taskId);
    await fetchAllData();
  };

  const handleRejectTask = async (taskId: string, reason?: string) => {
    await api.rejectTask(taskId, reason);
    await fetchAllData();
  };

  const handleCompleteTask = async (taskId: string) => {
    await api.completeTask(taskId);
    await fetchAllData();
  };

  const handleDecideApproval = async (
    id: string,
    decision: 'APPROVE' | 'REJECT' | 'MODIFY',
    notes?: string
  ) => {
    await api.decideApproval(id, decision, notes);
    await fetchAllData();
  };

  const handleCreateTask = async (task: Partial<CollectionTask>) => {
    await api.createTask(task);
    await fetchAllData();
  };

  const handleSimulateSpike = async (binId: string, level: number) => {
    await api.updateBin(binId, { fillLevel: level });
    await api.publishEvent({
      eventType: level >= 90 ? 'BIN_REACHED_90' : 'MANUAL_SIMULATION_EVENT',
      binId,
      details: { fillLevel: level },
      source: 'SIMULATOR',
    });
    await fetchAllData();
  };

  const handleSimulateFailure = async (binId: string) => {
    await api.runSimulationPreset('SENSOR_FAILURE', { binId });
    await fetchAllData();
  };

  const handleDispatchBin = async (binId: string) => {
    const targetBin = bins.find((b) => b.id === binId);
    if (!targetBin) return;

    await api.publishEvent({
      eventType: 'BIN_REACHED_90',
      binId,
      details: { fillLevel: targetBin.fillLevel, fillRatePerHour: targetBin.fillRatePerHour },
      source: 'DISPATCH_OPERATOR',
    });
    await fetchAllData();
  };

  const handleTriggerDemoStep = async (step?: number) => {
    const nextState = await api.triggerDemoStep(step);
    setDemoState(nextState);
    await fetchAllData();
  };

  const handleRunPreset = async (preset: string, payload?: any) => {
    await api.runSimulationPreset(preset, payload);
    await fetchAllData();
  };

  const handleInjectCustomEvent = async (binId: string, fillLevel: number, isDamaged: boolean) => {
    if (isDamaged) {
      await api.runSimulationPreset('SENSOR_FAILURE', { binId });
    } else {
      await handleSimulateSpike(binId, fillLevel);
    }
    await fetchAllData();
  };

  const handleResetData = async () => {
    await api.resetData();
    await fetchAllData();
  };

  const handleToggleTicker = async () => {
    const res = await api.toggleLiveTicker();
    setIsTickerRunning(res.isRunning);
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;
  const criticalBinsCount = bins.filter((b) => b.status === 'CRITICAL_OVERFLOW' || b.fillLevel >= 90).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <Header
        systemStatus={systemStatus}
        metrics={metrics}
        onOpenDemo={() => {
          setCurrentTab('simulator');
          handleTriggerDemoStep(1);
        }}
        onReset={handleResetData}
        onOpenConsole={() => setIsConsoleOpen(true)}
        onOpenCloudStatus={() => setIsCloudStatusOpen(true)}
        isTickerRunning={isTickerRunning}
        onToggleTicker={handleToggleTicker}
      />

      {/* Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        pendingApprovalsCount={pendingApprovalsCount}
        criticalBinsCount={criticalBinsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'operations' && (
          <OperationsDashboard
            metrics={metrics}
            bins={bins}
            tasks={tasks}
            approvals={approvals}
            vehicles={vehicles}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onApproveTask={handleApproveTask}
            onSelectBin={(bin) => {
              setSelectedBin(bin);
              setCurrentTab('map');
            }}
          />
        )}

        {currentTab === 'map' && (
          <LiveOperationsMap
            bins={bins}
            vehicles={vehicles}
            selectedBin={selectedBin}
            onSelectBin={(bin) => setSelectedBin(bin)}
            onSimulateSpike={handleSimulateSpike}
            onSimulateFailure={handleSimulateFailure}
            onDispatchBin={handleDispatchBin}
          />
        )}

        {currentTab === 'activity' && (
          <AgentActivityView
            activitySteps={activitySteps}
            decisions={decisions}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskManagement
            tasks={tasks}
            vehicles={vehicles}
            onApproveTask={handleApproveTask}
            onRejectTask={handleRejectTask}
            onCompleteTask={handleCompleteTask}
            onCreateTask={handleCreateTask}
          />
        )}

        {currentTab === 'approvals' && (
          <ApprovalCenter
            approvals={approvals}
            onDecideApproval={handleDecideApproval}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView analyticsData={analyticsData} />
        )}

        {currentTab === 'simulator' && (
          <DataSimulatorView
            bins={bins}
            vehicles={vehicles}
            demoState={demoState}
            onTriggerDemoStep={handleTriggerDemoStep}
            onRunPreset={handleRunPreset}
            onInjectCustomEvent={handleInjectCustomEvent}
            onReset={handleResetData}
            isTickerRunning={isTickerRunning}
            onToggleTicker={handleToggleTicker}
          />
        )}

        {currentTab === 'architecture' && (
          <ArchitectureView systemStatus={systemStatus} />
        )}
      </main>

      {/* Slide-out Agent Console */}
      <AgentConsoleDrawer
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        onRefreshAll={fetchAllData}
      />

      {/* Cloud Status Modal */}
      <CloudStatusModal
        isOpen={isCloudStatusOpen}
        onClose={() => setIsCloudStatusOpen(false)}
        systemStatus={systemStatus}
      />
    </div>
  );
}

export default App;
