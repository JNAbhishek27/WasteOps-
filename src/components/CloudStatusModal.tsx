import React from 'react';
import {
  Cloud,
  X,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
  Cpu,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { SystemStatus } from '../types';

interface CloudStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: SystemStatus | null;
}

export const CloudStatusModal: React.FC<CloudStatusModalProps> = ({
  isOpen,
  onClose,
  systemStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Google Cloud Platform Integration</h3>
              <p className="text-xs text-slate-500">Autonomous Infrastructure & Deployment Status</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          {/* Status Items */}
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900">Gemini 3.7 Flash Reasoning</div>
                <div className="text-[11px] text-slate-500">
                  {systemStatus?.gemini === 'CONNECTED'
                    ? 'GEMINI_API_KEY verified and active'
                    : 'Using deterministic local AI reasoning engine'}
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                systemStatus?.gemini === 'CONNECTED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {systemStatus?.gemini || 'ACTIVE'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-600" />
              <div>
                <div className="font-bold text-slate-900">Firestore Persistence Layer</div>
                <div className="text-[11px] text-slate-500">
                  {systemStatus?.firestore === 'CONNECTED'
                    ? 'Connected to Cloud Firestore database'
                    : 'In-memory persistent local DB adapter with auto-seed'}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-200 text-slate-700">
              {systemStatus?.firestore || 'LOCAL_ADAPTER'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-bold text-slate-900">Google Cloud Pub/Sub</div>
                <div className="text-[11px] text-slate-500">
                  {systemStatus?.pubsub === 'CONNECTED'
                    ? 'Subscribed to topic wasteops-events'
                    : 'Async background EventBus with live queue'}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-200 text-slate-700">
              {systemStatus?.pubsub || 'EVENT_BUS'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              <div>
                <div className="font-bold text-slate-900">Cloud Run Serverless Hosting</div>
                <div className="text-[11px] text-slate-500">
                  Production ready (Port 3000, multi-stage esbuild bundle)
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-700">
              READY
            </span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
