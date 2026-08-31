import React from 'react';
import {
  Network,
  Cloud,
  Cpu,
  Database,
  Radio,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Terminal,
  Bot,
  Zap,
} from 'lucide-react';
import { SystemStatus } from '../types';

interface ArchitectureViewProps {
  systemStatus: SystemStatus | null;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ systemStatus }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">System Architecture & Hackathon Track Alignment</h2>
            <p className="text-xs text-slate-500">
              Targeting "The Taskmaster" track with production-grade event-driven autonomous execution
            </p>
          </div>
        </div>
      </div>

      {/* TRACK ALIGNMENT CHECKLIST */}
      <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-5 sm:p-6 border border-emerald-800 shadow-lg">
        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            All Things Agentic Hackathon: "The Taskmaster" Track Compliance
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            {
              title: 'Event-Driven Workflow',
              desc: 'Continuous ingestion via EventBus & Pub/Sub for IoT surge spikes, sensor drops, and fleet telemetry.',
            },
            {
              title: 'Autonomous Decision Making',
              desc: 'Triage Agent dynamically classifies severity and computes exact minutes-to-overflow without human intervention.',
            },
            {
              title: 'Multi-Step Execution',
              desc: 'PERCEPTION → TRIAGE → MEMORY → ROUTING → ACTION → APPROVAL → VERIFICATION in a closed-loop sequence.',
            },
            {
              title: '13 Specialized Tools',
              desc: 'Structured tool calling for route optimization, vehicle dispatch, ticket creation, and audit logging.',
            },
            {
              title: 'Async Background Processing',
              desc: 'Non-blocking event loop processes background state updates while streaming live telemetry updates.',
            },
            {
              title: 'Persistent State & Memory',
              desc: 'Database state adapter with historical surge memory recall and immutable decision ledger.',
            },
            {
              title: 'Human-in-the-Loop Approval',
              desc: 'Sensitive, critical-severity dispatches trigger approval requests with operator sign-off or route modification.',
            },
            {
              title: 'Closed-Loop Verification',
              desc: 'Verification Agent audits post-service sensor drop to confirm fill rate cleared before marking tasks complete.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-emerald-900/40 rounded-xl border border-emerald-700/50">
              <div className="flex items-center space-x-1.5 font-bold text-white mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-emerald-200 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SYSTEM TOPOLOGY DIAGRAM */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500">
          Agentic Data Flow & Component Topology
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
          {/* Box 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Radio className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="font-bold text-slate-900">1. Ingestion Layer</div>
            <div className="text-[11px] text-slate-500 mt-1">
              IoT Fill Sensors, Battery Telemetry, Citizen Reports
            </div>
          </div>

          {/* Box 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <div className="font-bold text-slate-900">2. EventBus / Pub/Sub</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Topic: <code className="text-slate-700 font-mono font-bold">wasteops-events</code>
            </div>
          </div>

          {/* Box 3 */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <Bot className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <div className="font-bold text-indigo-900">3. Specialist Agents</div>
            <div className="text-[11px] text-indigo-700 mt-1">
              Triage • Route • Operations • Verification
            </div>
          </div>

          {/* Box 4 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Database className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className="font-bold text-slate-900">4. Firestore / DB Adapter</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Collections: bins, tasks, approvals, decisions, memories
            </div>
          </div>

          {/* Box 5 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <ShieldCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="font-bold text-slate-900">5. Operations Dashboard</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Live Map, HITL Approvals, Real-Time Auditing
            </div>
          </div>
        </div>
      </div>

      {/* GOOGLE CLOUD INTEGRATION STATUS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Cloud className="w-4 h-4 text-blue-600" />
          <span>Google Cloud & Gemini Runtime Environment</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Gemini AI Model</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Gemini 3.7 Flash</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Status: {systemStatus?.gemini || 'FALLBACK_READY'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Database Service</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Google Cloud Firestore</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Status: {systemStatus?.firestore || 'LOCAL_ADAPTER'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Messaging Broker</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Google Cloud Pub/Sub</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Status: {systemStatus?.pubsub || 'LOCAL_EVENT_BUS'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Server Host</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Google Cloud Run</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Status: {systemStatus?.cloudRun || 'DEV_CONTAINER'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
