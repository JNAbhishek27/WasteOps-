import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Filter,
  Flame,
  AlertTriangle,
  CheckCircle2,
  X,
  Zap,
  RotateCcw,
  Sliders,
  Send,
  Navigation,
  Info,
} from 'lucide-react';
import { Bin, Vehicle, WasteType, BinStatus } from '../types';

interface LiveOperationsMapProps {
  bins: Bin[];
  vehicles: Vehicle[];
  selectedBin: Bin | null;
  onSelectBin: (bin: Bin | null) => void;
  onSimulateSpike: (binId: string, level: number) => void;
  onSimulateFailure: (binId: string) => void;
  onDispatchBin: (binId: string) => void;
}

export const LiveOperationsMap: React.FC<LiveOperationsMapProps> = ({
  bins,
  vehicles,
  selectedBin,
  onSelectBin,
  onSimulateSpike,
  onSimulateFailure,
  onDispatchBin,
}) => {
  const [filterZone, setFilterZone] = useState<string>('ALL');
  const [filterWaste, setFilterWaste] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Convert GPS Coordinates (San Francisco Bay area bounding box approx) to SVG coordinate percentages
  // Bounds approx: lat 37.740 to 37.810, lng -122.460 to -122.380
  const latMin = 37.74;
  const latMax = 37.81;
  const lngMin = -122.46;
  const lngMax = -122.38;

  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 800 + 50;
    // Invert Y because latitude goes North-up
    const y = ((latMax - lat) / (latMax - latMin)) * 500 + 40;
    return { x: Math.max(30, Math.min(870, x)), y: Math.max(30, Math.min(550, y)) };
  };

  const filteredBins = bins.filter((bin) => {
    if (filterZone !== 'ALL' && bin.zone !== filterZone) return false;
    if (filterWaste !== 'ALL' && bin.wasteType !== filterWaste) return false;
    if (filterStatus === 'CRITICAL' && bin.fillLevel < 90) return false;
    if (filterStatus === 'AT_RISK' && (bin.fillLevel < 75 || bin.fillLevel >= 90)) return false;
    if (filterStatus === 'HEALTHY' && bin.fillLevel >= 75) return false;
    if (filterStatus === 'DAMAGED' && (bin.sensorHealthy || !bin.isDamaged)) return false;
    return true;
  });

  const getBinColorClass = (bin: Bin) => {
    if (!bin.sensorHealthy || bin.isDamaged) return 'fill-slate-800 stroke-slate-500 text-slate-800';
    if (bin.fillLevel >= 90) return 'fill-rose-500 stroke-rose-200 text-rose-500 animate-pulse';
    if (bin.fillLevel >= 80) return 'fill-orange-500 stroke-orange-200 text-orange-500';
    if (bin.fillLevel >= 70) return 'fill-amber-400 stroke-amber-200 text-amber-400';
    return 'fill-emerald-500 stroke-emerald-200 text-emerald-500';
  };

  return (
    <div className="space-y-4">
      {/* Map Control / Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses ({bins.length})</option>
            <option value="CRITICAL">Critical (≥ 90%)</option>
            <option value="AT_RISK">At Risk (75-89%)</option>
            <option value="HEALTHY">Healthy (&lt; 75%)</option>
            <option value="DAMAGED">Faulty / Damaged</option>
          </select>

          {/* Zone Filter */}
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Municipal Zones</option>
            <option value="Downtown Central">Downtown Central</option>
            <option value="Financial District">Financial District</option>
            <option value="Waterfront North">Waterfront North</option>
            <option value="Metro Park West">Metro Park West</option>
            <option value="South Historic">South Historic</option>
            <option value="Industrial Harbor">Industrial Harbor</option>
            <option value="Bayfront Stadium">Bayfront Stadium</option>
          </select>

          {/* Waste Type */}
          <select
            value={filterWaste}
            onChange={(e) => setFilterWaste(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Waste Types</option>
            <option value="general">General Waste</option>
            <option value="recyclable">Recyclables</option>
            <option value="organic">Organic Compost</option>
            <option value="hazardous">Hazardous</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-600 font-medium">Critical (≥90%)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-600 font-medium">Warning</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Healthy</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-600 font-medium">Fleet Unit</span>
          </span>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg h-[580px]">
        {/* SVG City Map Geometry */}
        <svg
          viewBox="0 0 900 600"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Water & Coastline */}
          <rect width="900" height="600" fill="#090d16" />
          <path
            d="M 500,0 C 530,120 520,200 600,280 C 680,360 620,440 680,600 L 900,600 L 900,0 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Urban Land Grid & Roads */}
          <g stroke="#1e293b" strokeWidth="1" opacity="0.6">
            <line x1="100" y1="0" x2="100" y2="600" />
            <line x1="200" y1="0" x2="200" y2="600" />
            <line x1="300" y1="0" x2="300" y2="600" />
            <line x1="400" y1="0" x2="400" y2="600" />
            <line x1="500" y1="0" x2="500" y2="600" />
            <line x1="0" y1="120" x2="900" y2="120" />
            <line x1="0" y1="240" x2="900" y2="240" />
            <line x1="0" y1="360" x2="900" y2="360" />
            <line x1="0" y1="480" x2="900" y2="480" />
          </g>

          {/* Main Arterials & Highways */}
          <path
            d="M 50,550 Q 250,300 450,100 T 700,50"
            fill="none"
            stroke="#334155"
            strokeWidth="3.5"
            strokeDasharray="8 4"
          />
          <path
            d="M 120,50 Q 300,280 600,320"
            fill="none"
            stroke="#334155"
            strokeWidth="2.5"
          />

          {/* Municipal Zone Outlines & Labels */}
          <g className="text-[11px] font-bold fill-slate-500 uppercase tracking-widest pointer-events-none select-none">
            <text x="260" y="240">Downtown Central</text>
            <text x="420" y="160">Financial District</text>
            <text x="480" y="80">Waterfront North</text>
            <text x="120" y="320">Metro Park West</text>
            <text x="240" y="480">South Historic</text>
            <text x="640" y="420">Industrial Harbor</text>
            <text x="460" y="380">Bayfront Stadium</text>
          </g>

          {/* Active Collection Route Lines */}
          {bins.map((bin) => {
            if (bin.assignedVehicleId) {
              const vehicle = vehicles.find((v) => v.id === bin.assignedVehicleId);
              if (vehicle) {
                const bCoord = projectCoords(bin.location.lat, bin.location.lng);
                const vCoord = projectCoords(vehicle.currentLocation.lat, vehicle.currentLocation.lng);
                return (
                  <g key={`route-${bin.id}-${vehicle.id}`}>
                    <line
                      x1={vCoord.x}
                      y1={vCoord.y}
                      x2={bCoord.x}
                      y2={bCoord.y}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                      className="animate-pulse"
                    />
                  </g>
                );
              }
            }
            return null;
          })}

          {/* Municipal Bin Pins */}
          {filteredBins.map((bin) => {
            const { x, y } = projectCoords(bin.location.lat, bin.location.lng);
            const isSelected = selectedBin?.id === bin.id;
            const isCritical = bin.fillLevel >= 90;

            return (
              <g
                key={bin.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => onSelectBin(bin)}
              >
                {/* Ping wave for critical nodes */}
                {isCritical && (
                  <circle
                    r="16"
                    className="fill-rose-500/20 stroke-rose-500 animate-ping opacity-60 pointer-events-none"
                  />
                )}

                {/* Selected Halo */}
                {isSelected && (
                  <circle
                    r="18"
                    className="fill-none stroke-emerald-400 stroke-2 animate-spin pointer-events-none"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Pin Body */}
                <circle
                  r={isSelected ? 11 : isCritical ? 10 : 8}
                  className={getBinColorClass(bin)}
                  strokeWidth="2"
                />

                {/* Fill Level Label */}
                <text
                  textAnchor="middle"
                  dy="3.5"
                  className="fill-white font-bold text-[9px] pointer-events-none font-mono"
                >
                  {bin.sensorHealthy ? bin.fillLevel : '!'}
                </text>

                {/* Bin ID Tooltip Marker */}
                <text
                  textAnchor="middle"
                  dy="-13"
                  className={`text-[9px] font-bold pointer-events-none ${
                    isCritical ? 'fill-rose-300' : 'fill-slate-400'
                  }`}
                >
                  {bin.id}
                </text>
              </g>
            );
          })}

          {/* Fleet Vehicle Pins */}
          {vehicles.map((v) => {
            const { x, y } = projectCoords(v.currentLocation.lat, v.currentLocation.lng);
            const isBusy = v.status === 'COLLECTING' || v.status === 'EN_ROUTE';

            return (
              <g
                key={v.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {isBusy && (
                  <circle
                    r="18"
                    className="fill-blue-500/20 stroke-blue-400 animate-pulse pointer-events-none"
                  />
                )}

                {/* Vehicle Marker */}
                <rect
                  x="-9"
                  y="-9"
                  width="18"
                  height="18"
                  rx="4"
                  fill="#2563eb"
                  stroke="#93c5fd"
                  strokeWidth="1.5"
                />
                <text
                  textAnchor="middle"
                  dy="3.5"
                  className="fill-white font-black text-[8px] pointer-events-none"
                >
                  {v.id.replace('TRUCK-', 'T')}
                </text>

                <text
                  textAnchor="middle"
                  dy="17"
                  className="fill-blue-300 text-[8px] font-bold pointer-events-none"
                >
                  {v.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Map Watermark */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>San Francisco Bay Smart Waste Telemetry Grid • Active Nodes: {filteredBins.length}</span>
        </div>
      </div>

      {/* DETAILED BIN INSPECTION DRAWER / MODAL */}
      {selectedBin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  selectedBin.fillLevel >= 90
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : selectedBin.fillLevel >= 75
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {selectedBin.fillLevel}%
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-lg text-slate-900">{selectedBin.id}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {selectedBin.wasteType.toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedBin.status === 'CRITICAL_OVERFLOW'
                        ? 'bg-rose-100 text-rose-700'
                        : selectedBin.status === 'HIGH_RISK'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {selectedBin.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedBin.location.address} • {selectedBin.zone} ({selectedBin.location.lat.toFixed(4)},{' '}
                  {selectedBin.location.lng.toFixed(4)})
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectBin(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Fill Rate</span>
              <div className="text-sm font-bold text-slate-900">+{selectedBin.fillRatePerHour}% / hour</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Predicted Overflow</span>
              <div className="text-sm font-bold text-rose-600">{selectedBin.predictedOverflowAt || 'in 35 min'}</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Sensor Battery</span>
              <div className="text-sm font-bold text-slate-900">{selectedBin.sensorBattery}%</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Assigned Unit</span>
              <div className="text-sm font-bold text-blue-600">{selectedBin.assignedVehicleId || 'None (In Queue)'}</div>
            </div>
          </div>

          {/* Action Simulator Controls for this Bin */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Inject Telemetry:</span>
              <button
                onClick={() => onSimulateSpike(selectedBin.id, 96)}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center space-x-1"
              >
                <Flame className="w-3 h-3" />
                <span>Surge to 96%</span>
              </button>
              <button
                onClick={() => onSimulateFailure(selectedBin.id)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Kill Sensor</span>
              </button>
              <button
                onClick={() => onSimulateSpike(selectedBin.id, 15)}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center space-x-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Empty to 15%</span>
              </button>
            </div>

            <button
              onClick={() => onDispatchBin(selectedBin.id)}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center space-x-1 shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>Trigger Autonomous Agent Dispatch</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
