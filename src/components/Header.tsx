import React from 'react';
import {
  Sparkles,
  Bot,
  Radio,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Activity,
  Terminal,
} from 'lucide-react';
import { SystemStatus, DashboardMetrics } from '../types';

interface HeaderProps {
  systemStatus: SystemStatus | null;
  metrics: DashboardMetrics | null;
  onOpenDemo: () => void;
  onReset: () => void;
  onOpenConsole: () => void;
  onOpenCloudStatus: () => void;
  isTickerRunning: boolean;
  onToggleTicker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  metrics,
  onOpenDemo,
  onReset,
  onOpenConsole,
  onOpenCloudStatus,
  isTickerRunning,
  onToggleTicker,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl text-slate-900 tracking-tight">WasteOps</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                  Taskmaster Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Autonomous AI Agent for Smart Waste Collection Operations
              </p>
            </div>
          </div>

          {/* Quick Status Badges & Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Ticker Toggle */}
            <button
              onClick={onToggleTicker}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isTickerRunning
                  ? 'bg-emerald-500 text-white shadow-xs animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Toggle continuous IoT sensor background simulation stream"
            >
              <Radio className="w-3.5 h-3.5 mr-1.5" />
              {isTickerRunning ? 'LIVE STREAMING' : 'STREAM PAUSED'}
            </button>

            {/* Cloud / Local Badge */}
            <button
              onClick={onOpenCloudStatus}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <Cloud className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              <span className="hidden md:inline">
                {systemStatus?.mode === 'GOOGLE_CLOUD' ? 'Google Cloud' : 'Local Dev Engine'}
              </span>
              <span className="md:hidden">GCP</span>
            </button>

            {/* AI Console Button */}
            <button
              onClick={onOpenConsole}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Agent Console</span>
            </button>

            {/* Hackathon Demo Mode Trigger */}
            <button
              onClick={onOpenDemo}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Demo Mode
            </button>

            {/* Reset Seed Data */}
            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset all bins, vehicles, and tasks to clean seed baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
