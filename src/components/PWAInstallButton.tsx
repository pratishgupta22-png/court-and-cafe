import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on device, show small subtle status or hide
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installed App</span>
      </div>
    );
  }

  // Chromium / Android / Play Store / Web APK flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 shadow-md hover:from-emerald-400 hover:to-amber-400 transition-all active:scale-95 border border-amber-400/40"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-850/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add to Phone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-amber-500/30 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div className="flex items-start gap-3 bg-zinc-950/80 border border-zinc-800 p-3 rounded-xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/40">1</span>
                  <p>Tap the <strong>Share</strong> button at the bottom of Safari.</p>
                </div>
                <div className="flex items-start gap-3 bg-zinc-950/80 border border-zinc-800 p-3 rounded-xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/40">2</span>
                  <p>Scroll down and select <strong>Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3 bg-zinc-950/80 border border-zinc-800 p-3 rounded-xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/40">3</span>
                  <p>Tap <strong>Add</strong> in the top right to launch full-screen anytime.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 py-2.5 text-sm font-bold text-zinc-950 hover:brightness-110 transition shadow-lg"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic prompt for desktop or unsupported beforeinstallprompt
  return (
    <button
      onClick={() => {
        alert("To install this app on your device:\n\n• On Chrome/Edge: Click the install icon in the address bar or Menu > 'Install App'\n• On Mobile: Tap Share > 'Add to Home screen'");
      }}
      className="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
      title="Install as Progressive Web App"
    >
      <Download className="w-3 h-3 text-emerald-400" />
      <span>Install App</span>
    </button>
  );
};
