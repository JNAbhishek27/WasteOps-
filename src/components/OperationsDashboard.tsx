import React from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Radio,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';
import { Bin, CollectionTask, ApprovalRequest, DashboardMetrics, Vehicle } from '../types';

interface OperationsDashboardProps {
  metrics: DashboardMetrics | null;
  bins: Bin[];
  tasks: CollectionTask[];
  approvals: ApprovalRequest[];
  vehicles: Vehicle[];
  onNavigateTab: (tab: any) => void;
  onApproveTask: (taskId: string) => void;
  onSelectBin: (bin: Bin) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  metrics,
  bins,
  tasks,
  approvals,
  vehicles,
  onNavigateTab,
  onApproveTask,
  onSelectBin,
}) => {
  // Find the most urgent critical bin
  const topCriticalBin = bins
    .filter((b) => b.status === 'CRITICAL_OVERFLOW' || b.fillLevel >= 90)
    .sort((a, b) => b.fillLevel - a.fillLevel)[0];

  const pendingApprovalForTopBin = topCriticalBin
    ? approvals.find((a) => a.binId === topCriticalBin.id && a.status === 'PENDING')
    : null;

  const criticalBins = bins.filter((b) => b.status === 'CRITICAL_OVERFLOW' || b.fillLevel >= 90);
  const activeTasks = tasks.filter((t) => t.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* 🔴 CRITICAL HERO ALERT BANNER (Immediate 5-second operational comprehension UX) */}
      {topCriticalBin && (
        <div className="bg-gradient-to-r from-rose-900 via-rose-850 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-rose-700/40 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                  <Flame className="w-3.5 h-3.5 mr-1" />
                  CRITICAL OVERFLOW EVENT
                </span>
                <span className="text-xs text-rose-200">
                  {topCriticalBin.zone} • {topCriticalBin.location.address}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Bin {topCriticalBin.id} predicted to overflow in {topCriticalBin.predictedOverflowAt || '31 minutes'}
              </h2>

              <p className="text-sm text-slate-300 max-w-3xl">
                WasteOps autonomous triage detected rapid surge ({topCriticalBin.fillRatePerHour}%/hr). Recommended
                action prepared: <strong className="text-white">TRUCK-07 (Apollo Rapid Compactor)</strong> routed with
                14-minute arrival ETA.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
              {pendingApprovalForTopBin ? (
                <button
                  onClick={() => onApproveTask(pendingApprovalForTopBin.taskId)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-900/30 transition-all flex items-center space-x-2 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Dispatch Task</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab('approvals')}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-md transition-all flex items-center space-x-2"
                >
                  <span>Review in Approval Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onSelectBin(topCriticalBin)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all"
              >
                Inspect Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Critical Bins */}
        <div
          onClick={() => onNavigateTab('map')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Bins</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics?.criticalBins ?? 7}</span>
            <span className="text-xs font-bold text-rose-600">≥ 90% Fill</span>
          </div>
        </div>

        {/* 2. Overflow Risk */}
        <div
          onClick={() => onNavigateTab('map')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overflow Risk</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics?.overflowRisk ?? 13}</span>
            <span className="text-xs font-medium text-amber-600">75-89% Fill</span>
          </div>
        </div>

        {/* 3. Active Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Tasks</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics?.activeTasks ?? 9}</span>
            <span className="text-xs font-medium text-blue-600">En Route</span>
          </div>
        </div>

        {/* 4. Pending Approvals */}
        <div
          onClick={() => onNavigateTab('approvals')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics?.pendingApprovals ?? 3}</span>
            <span className="text-xs font-bold text-purple-600">HITL Required</span>
          </div>
        </div>

        {/* 5. Completed Today */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Today</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics?.completedToday ?? 27}</span>
            <span className="text-xs font-medium text-emerald-600">Verified</span>
          </div>
        </div>

        {/* 6. Response Time Saved */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Response Saved</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics?.responseTimeSavedHours ?? 4.8} hrs</span>
            <span className="text-xs font-medium text-teal-600">AI Accelerated</span>
          </div>
        </div>
      </div>

      {/* CORE AGENTIC PIPELINE STRIP */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide uppercase text-slate-200">
              WasteOps Autonomous Operations Loop
            </span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Continuous Event-Driven Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { step: '1. PERCEPTION', desc: 'IoT sensor telemetry & fill spikes', color: 'border-blue-500/50 bg-blue-950/40 text-blue-300' },
            { step: '2. TRIAGE', desc: 'AI severity & surge rate prediction', color: 'border-amber-500/50 bg-amber-950/40 text-amber-300' },
            { step: '3. MEMORY', desc: 'Historical pattern & zone recall', color: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300' },
            { step: '4. ROUTING', desc: 'Vehicle capacity & ETA optimization', color: 'border-teal-500/50 bg-teal-950/40 text-teal-300' },
            { step: '5. APPROVAL', desc: 'Human sign-off for critical dispatches', color: 'border-purple-500/50 bg-purple-950/40 text-purple-300' },
            { step: '6. VERIFICATION', desc: 'Post-collection sensor drop audit', color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300' },
          ].map((item, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border ${item.color}`}>
              <div className="text-xs font-bold tracking-wider">{item.step}</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TWO-COLUMN OPERATIONAL STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Urgent Incidents & At-Risk Bins (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <span>Urgent Incidents & Risk Hotspots</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-700 rounded-full">
                {criticalBins.length} Nodes
              </span>
            </h3>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>View On Live Map</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            {criticalBins.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="font-medium text-slate-700">All municipal bins are within safe capacity limits.</p>
              </div>
            ) : (
              criticalBins.slice(0, 5).map((bin) => (
                <div
                  key={bin.id}
                  onClick={() => onSelectBin(bin)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        bin.fillLevel >= 90
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {bin.fillLevel}%
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {bin.id}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {bin.wasteType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{bin.location.address} • {bin.zone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-600">
                      Overflow {bin.predictedOverflowAt || 'in 35 min'}
                    </div>
                    <div className="text-[11px] text-slate-400">Rate: +{bin.fillRatePerHour}%/hr</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Fleet Readiness & Active Missions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <span>Fleet Readiness</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                {vehicles.filter((v) => v.status === 'AVAILABLE').length} Available
              </span>
            </h3>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Manage Tasks</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            {vehicles.slice(0, 5).map((vehicle) => (
              <div key={vehicle.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      vehicle.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-600'
                        : vehicle.status === 'COLLECTING' || vehicle.status === 'EN_ROUTE'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{vehicle.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {vehicle.zone} • Cap: {vehicle.capacityKg}kg
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      vehicle.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : vehicle.status === 'COLLECTING' || vehicle.status === 'EN_ROUTE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">Batt/Fuel: {vehicle.fuelOrBatteryLevel}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
