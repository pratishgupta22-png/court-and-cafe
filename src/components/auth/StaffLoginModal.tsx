import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  KeyRound,
  X,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  User,
  Shield,
  Phone,
} from 'lucide-react';

export const StaffLoginModal: React.FC = () => {
  const {
    isStaffLoginModalOpen,
    setIsStaffLoginModalOpen,
    staffLogin,
    staffUsers,
  } = useApp();

  // Selected staff profile for authentication (defaults to Owner Pratish Gupta)
  const defaultStaff = staffUsers.find(s => s.role === 'owner') || staffUsers[0];
  const [selectedStaff, setSelectedStaff] = useState(defaultStaff);

  // Form input states
  const [customIdentifier, setCustomIdentifier] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isStaffLoginModalOpen) {
      setPasswordInput('');
      setErrorMsg('');
      setIsSubmitting(false);
      setUseCustomInput(false);
      setCustomIdentifier('');
    }
  }, [isStaffLoginModalOpen]);

  if (!isStaffLoginModalOpen) return null;

  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!passwordInput.trim()) {
      setErrorMsg('Please enter your staff security password.');
      return;
    }

    const identifier = useCustomInput
      ? customIdentifier.trim()
      : selectedStaff.username || selectedStaff.staffId || selectedStaff.phone;

    if (!identifier) {
      setErrorMsg('Please enter or select a valid staff member.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = staffLogin(identifier, passwordInput);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Authentication failed: Incorrect password. Please try again.');
      } else {
        setPasswordInput('');
        setIsStaffLoginModalOpen(false);
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-zinc-900 border border-amber-500/30 shadow-2xl p-5 sm:p-6 overflow-hidden">
        {/* Ambient atmospheric lighting */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsStaffLoginModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/15 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">Staff & Owner Access</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                AUTHORIZED
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Secure console for court master, walk-in desk POS & kitchen orders
            </p>
          </div>
        </div>

        {/* Quick Staff Selection Chips */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Select Staff Profile
            </label>
            <button
              type="button"
              onClick={() => setUseCustomInput(!useCustomInput)}
              className="text-[11px] text-amber-400 hover:underline font-semibold"
            >
              {useCustomInput ? 'Select from list' : 'Type ID / Phone'}
            </button>
          </div>

          {!useCustomInput ? (
            <div className="grid grid-cols-2 gap-2">
              {staffUsers.map(s => {
                const isSelected = selectedStaff.staffId === s.staffId;
                const isOwner = s.role === 'owner';
                return (
                  <button
                    key={s.staffId}
                    type="button"
                    onClick={() => {
                      setSelectedStaff(s);
                      setErrorMsg('');
                    }}
                    className={`p-2.5 rounded-xl text-left transition border relative flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black truncate ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                          {s.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {isOwner ? 'Executive Owner' : s.roleTitle}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0 shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={customIdentifier}
                  onChange={e => setCustomIdentifier(e.target.value)}
                  placeholder="Enter Phone (8146820429) or Staff ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Security Password
              </label>
              <span className="text-[10px] text-zinc-400">
                {useCustomInput ? 'Enter password' : `for ${selectedStaff.name}`}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Enter password / PIN"
                className="w-full pl-10 pr-20 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono transition"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-zinc-400 hover:text-amber-400 font-semibold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Unlock & Launch Staff Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge at bottom */}
        <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Role-Based Access Control</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">v4.0 Live</span>
        </div>
      </div>
    </div>
  );
};
