import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  Truck,
  Clock,
  Flame,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ApprovalRequest } from '../types';

interface ApprovalCenterProps {
  approvals: ApprovalRequest[];
  onDecideApproval: (id: string, decision: 'APPROVE' | 'REJECT' | 'MODIFY', notes?: string) => void;
}

export const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  approvals,
  onDecideApproval,
}) => {
  const [modifyingId, setModifyingId] = useState<string | null>(null);
  const [modifyNotes, setModifyNotes] = useState('');

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const pastApprovals = approvals.filter((a) => a.status !== 'PENDING');

  const handleModifySubmit = (id: string) => {
    onDecideApproval(id, 'MODIFY', modifyNotes);
    setModifyingId(null);
    setModifyNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Human-in-the-Loop Approval Center</h2>
            <p className="text-xs text-slate-500">
              Review and authorize sensitive, high-impact autonomous dispatch recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
            {pendingApprovals.length} Pending Sign-Off
          </span>
        </div>
      </div>

      {/* PENDING APPROVALS LIST */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500 flex items-center space-x-2">
          <span>Action Required by Operations Manager</span>
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="font-medium text-slate-700">No pending approval requests. All autonomous dispatches authorized.</p>
          </div>
        ) : (
          pendingApprovals.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border-2 border-purple-200 p-5 sm:p-6 shadow-md relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white flex items-center space-x-1">
                      <Flame className="w-3 h-3" />
                      <span>{app.urgency} DISPATCH</span>
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Task ID: {app.taskId}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Requested {new Date(app.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Emergency collection proposed for {app.binId} (Fill Level: {app.fillLevel}%)
                  </h3>
                </div>

                <div className="flex items-center space-x-4 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 uppercase">Predicted Overflow</span>
                    <div className="text-sm font-bold text-rose-600">{app.predictedOverflow}</div>
                  </div>
                  <div className="h-8 w-px bg-purple-200" />
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 uppercase">Estimated ETA</span>
                    <div className="text-sm font-bold text-purple-900">{app.estimatedResponseTimeMinutes} mins</div>
                  </div>
                </div>
              </div>

              {/* RATIONALE & RECOMMENDATION */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4">
                <div className="md:col-span-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Agent Recommendation Rationale</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{app.reason}</p>
                </div>

                <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center space-x-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Recommended Unit</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{app.recommendedVehicleId}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Route Stops: {app.recommendedRoute.join(' → ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* MODIFY DRAWER (IF OPEN) */}
              {modifyingId === app.id && (
                <div className="my-3 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <label className="block text-xs font-bold text-amber-900">
                    Operator Route Modification / Instruction:
                  </label>
                  <input
                    type="text"
                    value={modifyNotes}
                    onChange={(e) => setModifyNotes(e.target.value)}
                    placeholder="e.g., Prioritize north alley access before main boulevard..."
                    className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg text-slate-800"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setModifyingId(null)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-amber-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleModifySubmit(app.id)}
                      className="px-3 py-1 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                      Apply & Dispatch
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onDecideApproval(app.id, 'REJECT')}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center space-x-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Dispatch</span>
                </button>

                <button
                  onClick={() => setModifyingId(app.id)}
                  className="px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-xl transition-colors flex items-center space-x-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Modify Route</span>
                </button>

                <button
                  onClick={() => onDecideApproval(app.id, 'APPROVE')}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Authorize Dispatch</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAST DECISIONS LOG */}
      {pastApprovals.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500">
            Authorization History ({pastApprovals.length})
          </h3>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {pastApprovals.map((app) => (
              <div key={app.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{app.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-medium">Bin: {app.binId}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  {app.modificationNotes && (
                    <p className="text-slate-500 text-[11px] mt-0.5">Notes: {app.modificationNotes}</p>
                  )}
                </div>

                <div className="text-right text-slate-400 font-mono text-[11px]">
                  {app.decidedAt ? new Date(app.decidedAt).toLocaleTimeString() : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
