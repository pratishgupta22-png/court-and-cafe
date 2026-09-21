import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShiftLog } from '../../types';
import {
  Package,
  CheckCircle,
  Lightbulb,
  FileText,
  Plus,
  Send,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const EquipmentInventoryView: React.FC = () => {
  const {
    equipment,
    checkOutEquipment,
    returnEquipment,
    courtLights,
    toggleCourtLight,
    courts,
    shiftLogs,
    addShiftLog,
  } = useApp();

  const [newLogMessage, setNewLogMessage] = useState('');
  const [newLogType, setNewLogType] = useState<ShiftLog['type']>('general');
  const [newLogStation, setNewLogStation] = useState<ShiftLog['station']>('Front Desk');

  const handlePostLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogMessage.trim()) return;
    addShiftLog(newLogMessage, newLogType, newLogStation);
    setNewLogMessage('');
  };

  const totalPaddlesOut = equipment
    .filter(e => e.category === 'paddle')
    .reduce((sum, e) => sum + e.inUse, 0);

  const totalBallsOut = equipment
    .filter(e => e.category === 'balls')
    .reduce((sum, e) => sum + e.inUse, 0);

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      
      {/* Header telemetry summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400">Pro Paddles Out on Court</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">{totalPaddlesOut}</span>
            <span className="text-xs text-zinc-400">active rentals</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Rental Rate: ₹50 / session</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400">Tournament Ball Cans In Play</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-400">{totalBallsOut}</span>
            <span className="text-xs text-zinc-400">cans issued</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Dura Fast 40+ Certified</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400">Court Lighting Grid</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {Object.values(courtLights).filter(Boolean).length}/4
            </span>
            <span className="text-xs text-zinc-400">courts illuminated</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">1000-Lux Energy Efficient</span>
        </div>
      </div>

      {/* Section 1: Equipment Rental & Pro Shop Inventory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              Pro Shop & Rental Equipment Inventory
            </h3>
            <p className="text-xs text-zinc-400">
              Track paddle checkout, ball cans, and automatic training machines.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {equipment.map(item => {
            const available = item.totalStock - item.inUse;
            const isOutOfStock = available <= 0;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {item.brand} • {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{item.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-zinc-800 text-zinc-300 font-mono">
                      ₹{item.rentalPrice}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Stock Availability</span>
                    <span className="font-bold font-mono">
                      <span className={isOutOfStock ? 'text-red-400' : 'text-emerald-400'}>
                        {available} in rack
                      </span>
                      <span className="text-zinc-500"> / {item.totalStock} total</span>
                    </span>
                  </div>

                  {/* Stock meter */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${(available / item.totalStock) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                  <button
                    onClick={() => checkOutEquipment(item.id)}
                    disabled={isOutOfStock}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                      isOutOfStock
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Rent Out</span>
                  </button>

                  <button
                    onClick={() => returnEquipment(item.id)}
                    disabled={item.inUse <= 0}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                      item.inUse <= 0
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Return ({item.inUse} out)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Smart Court Floodlight Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Court Smart Floodlight & Facility Power Controls
            </h3>
            <p className="text-xs text-zinc-400">
              Turn 1000-lux court floodlights ON when occupied, or OFF when empty to conserve facility electricity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {courts.map(court => {
            const isLit = !!courtLights[court.id];

            return (
              <div
                key={court.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  isLit
                    ? 'bg-gradient-to-b from-amber-950/20 via-zinc-900 to-zinc-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{court.name}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isLit ? 'bg-amber-400 shadow-md shadow-amber-400/80 animate-pulse' : 'bg-zinc-700'
                      }`}
                    ></span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 capitalize">{court.type} • {court.surface}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div className="text-[11px] font-mono">
                    <span className="text-zinc-400">Status: </span>
                    <span className={isLit ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                      {isLit ? '1000 LUX ON' : 'STANDBY OFF'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCourtLight(court.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isLit
                        ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isLit ? 'Turn Off' : 'Turn On'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Staff Shift Handover & Daily Notes */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            Staff Shift Handover & Incident Log
          </h3>
          <p className="text-xs text-zinc-400">
            Real-time notes exchanged across Front Desk, Barista KDS, and Facility Managers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Create Log Form */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
              Add Handover Note
            </h4>
            <form onSubmit={handlePostLog} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Station</label>
                <select
                  value={newLogStation}
                  onChange={e => setNewLogStation(e.target.value as ShiftLog['station'])}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="Front Desk">Front Desk (Reception)</option>
                  <option value="Cafe KDS">Cafe Kitchen / Barista</option>
                  <option value="Facility Manager">Facility Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Category</label>
                <select
                  value={newLogType}
                  onChange={e => setNewLogType(e.target.value as ShiftLog['type'])}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="general">General Operations</option>
                  <option value="maintenance">Court Maintenance</option>
                  <option value="inventory">Cafe / Gear Supplies</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Log Details</label>
                <textarea
                  value={newLogMessage}
                  onChange={e => setNewLogMessage(e.target.value)}
                  placeholder="e.g. Court 3 net tension verified. Fresh electrolytes restocked."
                  rows={3}
                  required
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </form>
          </div>

          {/* Log History */}
          <div className="lg:col-span-2 space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
            {shiftLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-[10px]">
                  {log.timestamp}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{log.author}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                      {log.station}
                    </span>
                    <span className="text-[10px] font-semibold text-teal-400 uppercase">
                      {log.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};
