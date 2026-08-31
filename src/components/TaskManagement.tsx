import React, { useState } from 'react';
import {
  CheckSquare,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Filter,
  ArrowRight,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { CollectionTask, TaskPriority, TaskStatus, Vehicle } from '../types';

interface TaskManagementProps {
  tasks: CollectionTask[];
  vehicles: Vehicle[];
  onApproveTask: (taskId: string) => void;
  onRejectTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onCreateTask: (task: Partial<CollectionTask>) => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks,
  vehicles,
  onApproveTask,
  onRejectTask,
  onCompleteTask,
  onCreateTask,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New task form state
  const [newBinId, setNewBinId] = useState('BIN-104');
  const [newPriority, setNewPriority] = useState<TaskPriority>('HIGH');
  const [newVehicleId, setNewVehicleId] = useState('TRUCK-01');
  const [newJustification, setNewJustification] = useState('Manual operator dispatch for overflow prevention.');

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTask({
      primaryBinId: newBinId,
      binIds: [newBinId],
      priority: newPriority,
      vehicleId: newVehicleId,
      justification: newJustification,
      status: 'ACTIVE',
      createdBy: 'Operations Dispatcher',
      etaMinutes: 15,
      estimatedDistanceKm: 3.2,
      verificationStatus: 'NOT_STARTED',
      approvalRequired: false,
    });
    setShowCreateModal(false);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'EMERGENCY':
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-700 animate-pulse';
      case 'APPROVAL':
        return 'bg-purple-100 text-purple-700';
      case 'FAILED':
        return 'bg-rose-100 text-rose-700';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Task Dispatch & Verification Control</h2>
            <p className="text-xs text-slate-500">
              Manage, monitor, and verify autonomous collection missions across the municipal fleet
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection Task</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter Tasks:</span>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
        >
          <option value="ALL">All Statuses ({tasks.length})</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="APPROVAL">APPROVAL REQUIRED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">CRITICAL / EMERGENCY</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-slate-900">{task.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Target: <strong className="text-slate-800">{task.primaryBinId}</strong>
                    {task.binIds.length > 1 && (
                      <span className="text-slate-400"> (+{task.binIds.length - 1} grouped stops)</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>ETA: {task.etaMinutes} min</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{task.estimatedDistanceKm} km</div>
                </div>
              </div>

              {/* Justification / Rationale */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                <span className="font-semibold text-slate-900">Rationale: </span>
                {task.justification}
              </div>

              {/* Assigned Vehicle & Verification Status */}
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-600">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>
                    Unit: <strong className="text-slate-900">{task.vehicleId || 'Unassigned'}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-slate-400">Verification:</span>
                  <span
                    className={`font-bold text-[11px] ${
                      task.verificationStatus === 'SUCCESS'
                        ? 'text-emerald-600'
                        : task.verificationStatus === 'FAILED'
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {task.verificationStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              {task.status === 'APPROVAL' && (
                <>
                  <button
                    onClick={() => onRejectTask(task.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApproveTask(task.id)}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-xs flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve Task</span>
                  </button>
                </>
              )}

              {task.status === 'ACTIVE' && (
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-xs flex items-center space-x-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Verify Telemetry & Complete</span>
                </button>
              )}

              {task.status === 'COMPLETED' && (
                <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Telemetry Verified</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900">Create New Collection Task</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct operator dispatch bypass with automated route geometry calculation.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Bin ID</label>
                <input
                  type="text"
                  value={newBinId}
                  onChange={(e) => setNewBinId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                >
                  <option value="CRITICAL">CRITICAL (Immediate)</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Fleet Vehicle</label>
                <select
                  value={newVehicleId}
                  onChange={(e) => setNewVehicleId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.id} - {v.name} ({v.zone}, {v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Justification</label>
                <textarea
                  value={newJustification}
                  onChange={(e) => setNewJustification(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 h-20"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                >
                  Create & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
