import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Bot,
} from 'lucide-react';
import { DashboardMetrics } from '../types';

interface AnalyticsViewProps {
  analyticsData: {
    metrics: DashboardMetrics;
    zoneStats: Record<string, { total: number; critical: number; healthy: number }>;
    hourlyTrends: Array<{ hour: string; incidents: number; resolved: number; latencySec: number }>;
    fleetCount: number;
    activeTasksCount: number;
    completedTasksCount: number;
  } | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analyticsData }) => {
  const metrics = analyticsData?.metrics;
  const trends = analyticsData?.hourlyTrends || [];

  const zoneChartData = (Object.entries(analyticsData?.zoneStats || {}) as Array<[string, { total: number; critical: number; healthy: number }]>).map(([zone, stat]) => ({
    name: zone.split(' ')[0],
    total: stat.total,
    critical: stat.critical,
    healthy: stat.healthy,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Operational Autonomy & SLA Analytics</h2>
            <p className="text-xs text-slate-500">
              Measuring autonomous efficiency gains, response latency, and municipal collection SLAs
            </p>
          </div>
        </div>
      </div>

      {/* Autonomy Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Autonomy Ratio</span>
            <Bot className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">84.2%</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Autonomous dispatch without human bottleneck</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Avg Agent Latency</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">1.8s</div>
          <div className="text-xs text-slate-500 font-medium mt-1">From sensor spike to optimized route</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Response Time Saved</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {metrics?.responseTimeSavedHours || 4.8} hrs
          </div>
          <div className="text-xs text-teal-600 font-medium mt-1">Compared to manual dispatcher cycle</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Verification Rate</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">97.8%</div>
          <div className="text-xs text-purple-600 font-medium mt-1">Post-service sensor telemetry drop confirmed</div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Volume vs Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            Surge Incidents Detected vs Autonomous Resolutions
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  name="Spikes Ingested"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorIncidents)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved by Agent"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Node Capacity Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Municipal Zone Node Health Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="healthy" name="Healthy Nodes" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="critical" name="Critical Surge" fill="#f43f5e" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
