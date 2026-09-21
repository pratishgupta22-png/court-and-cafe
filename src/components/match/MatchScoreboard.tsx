import React, { useState, useEffect } from 'react';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRightLeft,
  CheckCircle2,
  Users,
  Timer,
  Maximize2,
  Sparkles,
  X,
  Volume1,
} from 'lucide-react';

interface MatchScoreboardProps {
  courtName?: string;
  onClose?: () => void;
  teamANames?: [string, string];
  teamBNames?: [string, string];
}

interface ScoreHistoryState {
  teamAScore: number;
  teamBScore: number;
  servingTeam: 'A' | 'B';
  serverNumber: 1 | 2;
  teamAServerOnRight: 0 | 1;
  teamBServerOnRight: 0 | 1;
}

export const MatchScoreboard: React.FC<MatchScoreboardProps> = ({
  courtName = 'The Center Court',
  onClose,
  teamANames = ['Rohan Patel', 'Arjun Verma'],
  teamBNames = ['Vikram S.', 'Kabir Mehta'],
}) => {
  // Scoreboard State
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [servingTeam, setServingTeam] = useState<'A' | 'B'>('A');
  const [serverNumber, setServerNumber] = useState<1 | 2>(2); // Standard pickleball begins at 0-0-2
  const [history, setHistory] = useState<ScoreHistoryState[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [gameWonBy, setGameWonBy] = useState<'A' | 'B' | null>(null);

  // Match Timer
  const [matchSeconds, setMatchSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Sound generator
  const playSound = (type: 'point' | 'fault' | 'win') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'point') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'fault') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.95);
      }
    } catch {
      // ignore
    }
  };

  // Announce score using speech synthesis
  const speakScore = (sTeam: 'A' | 'B', aScore: number, bScore: number, sNum: 1 | 2) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const serverScore = sTeam === 'A' ? aScore : bScore;
      const receiverScore = sTeam === 'A' ? bScore : aScore;
      const text = `${serverScore}, ${receiverScore}, ${sNum}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && !gameWonBy) {
      interval = setInterval(() => {
        setMatchSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, gameWonBy]);

  const saveHistory = () => {
    setHistory(prev => [
      ...prev,
      {
        teamAScore,
        teamBScore,
        servingTeam,
        serverNumber,
        teamAServerOnRight: 0,
        teamBServerOnRight: 0,
      },
    ]);
  };

  const handlePointServingTeam = () => {
    if (gameWonBy) return;
    saveHistory();
    playSound('point');

    if (servingTeam === 'A') {
      const nextScore = teamAScore + 1;
      setTeamAScore(nextScore);

      if (nextScore >= 11 && nextScore - teamBScore >= 2) {
        setGameWonBy('A');
        playSound('win');
      } else {
        speakScore('A', nextScore, teamBScore, serverNumber);
      }
    } else {
      const nextScore = teamBScore + 1;
      setTeamBScore(nextScore);

      if (nextScore >= 11 && nextScore - teamAScore >= 2) {
        setGameWonBy('B');
        playSound('win');
      } else {
        speakScore('B', teamAScore, nextScore, serverNumber);
      }
    }
  };

  const handleFault = () => {
    if (gameWonBy) return;
    saveHistory();
    playSound('fault');

    // If server 1 faulted, move to server 2
    if (serverNumber === 1) {
      setServerNumber(2);
      speakScore(servingTeam, teamAScore, teamBScore, 2);
    } else {
      // Side Out! Opposing team gets service as Server 1
      const nextServingTeam = servingTeam === 'A' ? 'B' : 'A';
      setServingTeam(nextServingTeam);
      setServerNumber(1);
      speakScore(nextServingTeam, teamAScore, teamBScore, 1);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setTeamAScore(last.teamAScore);
    setTeamBScore(last.teamBScore);
    setServingTeam(last.servingTeam);
    setServerNumber(last.serverNumber);
    setGameWonBy(null);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleResetMatch = () => {
    setTeamAScore(0);
    setTeamBScore(0);
    setServingTeam('A');
    setServerNumber(2);
    setHistory([]);
    setGameWonBy(null);
    setMatchSeconds(0);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Official Pickleball Callout String: e.g. "4 - 2 - 1"
  const officialCallout = `${servingTeam === 'A' ? teamAScore : teamBScore} - ${
    servingTeam === 'A' ? teamBScore : teamAScore
  } - ${serverNumber}`;

  return (
    <div className="bg-zinc-950 text-white rounded-3xl border border-zinc-800 p-5 sm:p-7 shadow-2xl space-y-6 max-w-4xl mx-auto">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                COURTSIDE REFEREE HUD
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                {courtName}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
              Official USA Pickleball Side-Out Scoring
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
              speechEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            title="Speech Synthesizer Callouts"
          >
            <Volume1 className="w-4 h-4" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
            title="Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-amber-400">
            <Timer className="w-3.5 h-3.5 text-zinc-500" />
            <span>{formatTimer(matchSeconds)}</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Banner Callout: "4 - 2 - 1" */}
      <div className="text-center bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 shadow-inner">
        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
          OFFICIAL VERBAL CALLOUT (SERVER - RECEIVER - SERVER #)
        </span>
        <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-amber-400">
          {gameWonBy ? (
            <span className="text-emerald-400">GAME OVER • TEAM {gameWonBy} WINS!</span>
          ) : (
            officialCallout
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-1.5">
          {servingTeam === 'A' ? teamANames.join(' & ') : teamBNames.join(' & ')} currently serving on Server #{serverNumber}
        </p>
      </div>

      {/* Main Score Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Team A Card */}
        <div
          className={`p-5 sm:p-6 rounded-3xl border-2 transition relative flex flex-col justify-between ${
            servingTeam === 'A'
              ? 'bg-zinc-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
              : 'bg-zinc-900/40 border-zinc-800'
          }`}
        >
          {servingTeam === 'A' && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500 text-zinc-950 flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3" />
                <span>SERVING (S{serverNumber})</span>
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">TEAM A</span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-400">Near Baseline</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {teamANames[0]} & {teamANames[1]}
            </h3>
          </div>

          <div className="my-6 text-center">
            <span className="text-7xl sm:text-8xl font-black font-mono text-white tracking-tight">
              {teamAScore}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
            <span>Points to Win (11):</span>
            <span className="font-mono font-bold text-white">
              {Math.max(0, 11 - teamAScore)} points left
            </span>
          </div>
        </div>

        {/* Team B Card */}
        <div
          className={`p-5 sm:p-6 rounded-3xl border-2 transition relative flex flex-col justify-between ${
            servingTeam === 'B'
              ? 'bg-zinc-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
              : 'bg-zinc-900/40 border-zinc-800'
          }`}
        >
          {servingTeam === 'B' && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500 text-zinc-950 flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3" />
                <span>SERVING (S{serverNumber})</span>
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">TEAM B</span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-400">Far Baseline</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {teamBNames[0]} & {teamBNames[1]}
            </h3>
          </div>

          <div className="my-6 text-center">
            <span className="text-7xl sm:text-8xl font-black font-mono text-white tracking-tight">
              {teamBScore}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
            <span>Points to Win (11):</span>
            <span className="font-mono font-bold text-white">
              {Math.max(0, 11 - teamBScore)} points left
            </span>
          </div>
        </div>
      </div>

      {/* Courtside Big Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Point to Serving Team */}
        <button
          onClick={handlePointServingTeam}
          disabled={!!gameWonBy}
          className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black text-base shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Point to Server ({servingTeam === 'A' ? 'Team A' : 'Team B'})</span>
        </button>

        {/* Fault / Side-Out */}
        <button
          onClick={handleFault}
          disabled={!!gameWonBy}
          className="py-4 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-amber-500 text-amber-400 font-black text-base transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <ArrowRightLeft className="w-5 h-5" />
          <span>Fault / {serverNumber === 1 ? 'Switch to Server 2' : 'SIDE OUT'}</span>
        </button>

        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          className="py-4 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-sm transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Undo Last Rally</span>
        </button>
      </div>

      {/* Mini Court Diagram Showing Server Position */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-zinc-300 block">USA Pickleball Rules Quick Guide:</span>
          <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
            Only the serving team scores points. Side out occurs after Server 2 faults. Play continues until a team scores 11 points with a 2-point lead.
          </p>
        </div>

        <button
          onClick={handleResetMatch}
          className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Match Score</span>
        </button>
      </div>
    </div>
  );
};
