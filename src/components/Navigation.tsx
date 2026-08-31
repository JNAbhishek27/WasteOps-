import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Activity,
  CheckSquare,
  ShieldAlert,
  BarChart3,
  Sliders,
  Network,
} from 'lucide-react';

export type TabType =
  | 'operations'
  | 'map'
  | 'activity'
  | 'tasks'
  | 'approvals'
  | 'analytics'
  | 'simulator'
  | 'architecture';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingApprovalsCount: number;
  criticalBinsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  pendingApprovalsCount,
  criticalBinsCount,
}) => {
  const tabs = [
    {
      id: 'operations' as TabType,
      label: 'Operations',
      icon: LayoutDashboard,
      badge: criticalBinsCount > 0 ? criticalBinsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'map' as TabType,
      label: 'Live Map',
      icon: MapPin,
    },
    {
      id: 'activity' as TabType,
      label: 'Agent Activity',
      icon: Activity,
    },
    {
      id: 'tasks' as TabType,
      label: 'Tasks',
      icon: CheckSquare,
    },
    {
      id: 'approvals' as TabType,
      label: 'Approvals',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500 text-white animate-pulse',
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'simulator' as TabType,
      label: 'Data Simulator',
      icon: Sliders,
    },
    {
      id: 'architecture' as TabType,
      label: 'Architecture',
      icon: Network,
    },
  ];

  return (
    <nav className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mr-2 ${
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={`ml-2 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                      tab.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
