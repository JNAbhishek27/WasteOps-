import React, { useState } from 'react';
import {
  Activity,
  Bot,
  Terminal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Filter,
  Code,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AgentActivityStep, AgentDecision } from '../types';

interface AgentActivityViewProps {
  activitySteps: AgentActivityStep[];
  decisions: AgentDecision[];
}

export const AgentActivityView: React.FC<AgentActivityViewProps> = ({
  activitySteps,
  decisions,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'timeline' | 'decisions'>('timeline');

  const toggleExpand = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSteps = activitySteps.filter((step) => {
    if (selectedAgent !== 'ALL' && step.agent !== selectedAgent) return false;
    if (selectedStage !== 'ALL' && step.stage !== selectedStage) return false;
    return true;
  });

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'PERCEPTION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TRIAGE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEMORY':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ROUTING':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'ACTION':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'APPROVAL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'VERIFY':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header & Mode Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Agentic Reasoning & Tool Execution Log</h2>
            <p className="text-xs text-slate-500">
              Live audit trail of autonomous multi-agent task execution and deterministic verification
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'timeline'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Workflow Timeline ({activitySteps.length})
          </button>
          <button
            onClick={() => setViewMode('decisions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'decisions'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Decisions ({decisions.length})
          </button>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filter Agents:</span>
            </div>

            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Agents</option>
              <option value="Triage Agent">Triage Agent</option>
              <option value="Route Agent">Route Agent</option>
              <option value="Operations Agent">Operations Agent</option>
              <option value="Verification Agent">Verification Agent</option>
              <option value="WasteOps Orchestrator">WasteOps Orchestrator</option>
              <option value="Memory Service">Memory Service</option>
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Stages</option>
              <option value="PERCEPTION">PERCEPTION</option>
              <option value="TRIAGE">TRIAGE</option>
              <option value="MEMORY">MEMORY</option>
              <option value="ROUTING">ROUTING</option>
              <option value="ACTION">ACTION</option>
              <option value="APPROVAL">APPROVAL</option>
              <option value="VERIFY">VERIFY</option>
            </select>
          </div>

          {/* Timeline Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {filteredSteps.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Bot className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-medium text-slate-600">No activity steps matching selected filters.</p>
              </div>
            ) : (
              filteredSteps.map((step) => {
                const isExpanded = !!expandedSteps[step.id];
                return (
                  <div key={step.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                    <div
                      onClick={() => toggleExpand(step.id)}
                      className="flex items-start justify-between cursor-pointer group"
                    >
                      <div className="flex items-start space-x-3">
                        <button className="mt-1 text-slate-400 group-hover:text-slate-600">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getStageBadgeColor(
                                step.stage
                              )}`}
                            >
                              {step.stage}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{step.agent}</span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="text-xs font-mono text-slate-500">{step.action}</span>
                            {step.target && (
                              <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono">
                                {step.target}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 mt-1 font-medium">{step.outputSummary}</p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end space-y-1">
                        <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">
                          {step.durationMs}ms
                        </span>
                      </div>
                    </div>

                    {/* Expandable Reasoning & Tool Trace */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 pl-7 space-y-3">
                        {/* Reasoning Chain */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Agent Reasoning Rationale</span>
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed font-sans">{step.reasoning}</p>
                          {step.inputSummary && (
                            <div className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                              <strong className="text-slate-700">Observed Input:</strong> {step.inputSummary}
                            </div>
                          )}
                        </div>

                        {/* Tool Invocation Details */}
                        {step.toolUsed && (
                          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs font-mono overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-1 flex items-center space-x-1.5">
                              <Code className="w-3.5 h-3.5" />
                              <span>Tool Invoked: {step.toolUsed}()</span>
                            </div>
                            {step.toolArgs && (
                              <div className="text-[11px] text-slate-400 mt-1">
                                <span className="text-slate-500">// Arguments:</span>
                                <pre className="text-slate-300 mt-0.5">{JSON.stringify(step.toolArgs, null, 2)}</pre>
                              </div>
                            )}
                            {step.toolResult && (
                              <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                                <span className="text-emerald-500">// Return Result:</span>
                                <pre className="text-emerald-300 mt-0.5">{JSON.stringify(step.toolResult, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Immutable Audit Decisions Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Immutable Agent Decision Ledger</h3>
            <span className="text-xs text-slate-500">Compliant for Municipal Audit & Reporting</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Trigger Event</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Target ID</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {decisions.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(d.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{d.agent}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">{d.triggerEvent}</td>
                    <td className="py-3 px-4 font-medium text-emerald-700">{d.actionTaken}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.targetId}</td>
                    <td className="py-3 px-4 font-mono font-bold">{Math.round(d.confidenceScore * 100)}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.result === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {d.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
