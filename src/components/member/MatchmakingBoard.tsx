import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Trophy,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Sparkles,
  Zap,
  Swords,
  ChevronRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { playPaddleImpact, playCashChime } from '../../utils/audio';

export interface PlayerChallenge {
  id: string;
  hostName: string;
  hostAvatar?: string;
  hostDupr: number;
  format: 'Singles (1v1)' | 'Doubles (2v2)';
  courtName: string;
  time: string;
  date: string;
  targetSkill: '2.5 Novice' | '3.0 Intermediate' | '3.5 Advanced' | '4.0+ DUPR';
  spotsNeeded: number;
  totalSpots: number;
  note: string;
  joinedPlayers: string[];
}

const INITIAL_CHALLENGES: PlayerChallenge[] = [
  {
    id: 'chal-1',
    hostName: 'Pratish Gupta',
    hostDupr: 3.8,
    format: 'Doubles (2v2)',
    courtName: 'Center Court Arena',
    time: '07:30 PM Today',
    date: new Date().toISOString().split('T')[0],
    targetSkill: '3.5 Advanced',
    spotsNeeded: 1,
    totalSpots: 4,
    note: 'Looking for 1 aggressive net dinker to complete doubles quad! Loser buys iced cold coffees.',
    joinedPlayers: ['Pratish Gupta (3.8)', 'Rohan Verma (3.5)', 'Amit Shah (3.6)'],
  },
  {
    id: 'chal-2',
    hostName: 'Sunil Rao',
    hostDupr: 4.2,
    format: 'Singles (1v1)',
    courtName: 'Center Court Arena',
    time: '09:00 PM Tonight',
    date: new Date().toISOString().split('T')[0],
    targetSkill: '4.0+ DUPR',
    spotsNeeded: 1,
    totalSpots: 2,
    note: 'Full-court singles endurance battle. High pace third-shot drop practice.',
    joinedPlayers: ['Sunil Rao (4.2)'],
  },
  {
    id: 'chal-3',
    hostName: 'Ananya Deshmukh',
    hostDupr: 2.8,
    format: 'Doubles (2v2)',
    courtName: 'Center Court Arena',
    time: '06:00 PM Tomorrow',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    targetSkill: '3.0 Intermediate',
    spotsNeeded: 2,
    totalSpots: 4,
    note: 'Friendly Saturday evening mixed doubles! Focus on consistent kitchen dinking.',
    joinedPlayers: ['Ananya Deshmukh (2.8)', 'Kavita Roy (3.0)'],
  },
];

interface Props {
  onBookCourt?: () => void;
}

export const MatchmakingBoard: React.FC<Props> = ({ onBookCourt }) => {
  const { currentUser, addToast } = useApp();

  const [challenges, setChallenges] = useState<PlayerChallenge[]>(() => {
    const saved = localStorage.getItem('court_cafe_challenges');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_CHALLENGES;
  });

  const [filterSkill, setFilterSkill] = useState<string>('all');
  const [isPosting, setIsPosting] = useState(false);

  // New challenge form state
  const [newFormat, setNewFormat] = useState<'Singles (1v1)' | 'Doubles (2v2)'>('Doubles (2v2)');
  const [newSkill, setNewSkill] = useState<'2.5 Novice' | '3.0 Intermediate' | '3.5 Advanced' | '4.0+ DUPR'>('3.5 Advanced');
  const [newTime, setNewTime] = useState('08:00 PM Today');
  const [newNote, setNewNote] = useState('');

  const handleJoinChallenge = (challengeId: string) => {
    playPaddleImpact();
    const playerName = currentUser?.name ? `${currentUser.name} (${currentUser.duprRating || '3.5'})` : 'Guest Player (3.5)';

    setChallenges(prev => {
      const updated = prev.map(c => {
        if (c.id === challengeId) {
          if (c.spotsNeeded <= 0) {
            addToast('Match Full', 'All spots have been filled for this game.', 'info');
            return c;
          }
          if (c.joinedPlayers.includes(playerName)) {
            addToast('Already Joined', 'You are already registered on this challenge roster.', 'info');
            return c;
          }
          const nextSpots = c.spotsNeeded - 1;
          const nextPlayers = [...c.joinedPlayers, playerName];
          addToast(
            'Challenge Accepted! 🎾',
            `You joined ${c.hostName}'s game (${c.time}). See you at Center Court!`,
            'success'
          );
          return {
            ...c,
            spotsNeeded: nextSpots,
            joinedPlayers: nextPlayers,
          };
        }
        return c;
      });
      localStorage.setItem('court_cafe_challenges', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    playCashChime();

    const playerName = currentUser?.name || 'Club Member';
    const totalSpots = newFormat === 'Singles (1v1)' ? 2 : 4;
    const spotsNeeded = totalSpots - 1;

    const newChal: PlayerChallenge = {
      id: 'chal-' + Date.now(),
      hostName: playerName,
      hostDupr: currentUser?.duprRating || 3.5,
      format: newFormat,
      courtName: 'Center Court Arena',
      time: newTime,
      date: new Date().toISOString().split('T')[0],
      targetSkill: newSkill,
      spotsNeeded,
      totalSpots,
      note: newNote.trim() || 'Looking for great pickleball rallies at Court & Cafe!',
      joinedPlayers: [`${playerName} (${currentUser?.duprRating || 3.5})`],
    };

    const updated = [newChal, ...challenges];
    setChallenges(updated);
    localStorage.setItem('court_cafe_challenges', JSON.stringify(updated));

    setIsPosting(false);
    setNewNote('');
    addToast(
      'Match Challenge Live! ⚡',
      `Your ${newFormat} challenge is live for other players to join.`,
      'success'
    );
  };

  const filteredChallenges = challenges.filter(c => {
    if (filterSkill === 'all') return true;
    return c.targetSkill.includes(filterSkill);
  });

  return (
    <div className="space-y-5">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-950/70 via-zinc-900 to-zinc-900 border border-teal-500/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black border border-teal-500/40 shadow-lg shadow-teal-500/10">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Matchmaking & DUPR Challenge Board
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                LIVE PICKUP
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Find partners, issue pickup challenges by skill rating, and drop in for high-intensity rallies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPosting(!isPosting)}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs shadow-md shadow-teal-500/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post Match Challenge</span>
          </button>
        </div>
      </div>

      {/* Posting Modal / Accordion */}
      {isPosting && (
        <form
          onSubmit={handleCreateChallenge}
          className="p-5 rounded-3xl bg-zinc-900/90 border border-teal-500/40 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Broadcast a Game Invitation</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Match Format</label>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value as unknown as 'Singles (1v1)' | 'Doubles (2v2)')}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold"
              >
                <option value="Doubles (2v2)">Doubles (2v2 • 4 Players)</option>
                <option value="Singles (1v1)">Singles (1v1 • 2 Players)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Target DUPR Skill Level</label>
              <select
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value as unknown as '2.5 Novice' | '3.0 Intermediate' | '3.5 Advanced' | '4.0+ DUPR')}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold"
              >
                <option value="2.5 Novice">2.5 Novice / All-Levels</option>
                <option value="3.0 Intermediate">3.0 Intermediate</option>
                <option value="3.5 Advanced">3.5 Advanced Dinkers</option>
                <option value="4.0+ DUPR">4.0+ Tournament DUPR</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Game Time</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 08:30 PM Today"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Game Pitch / Note to Players</label>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. Fast-paced rallies, working on 3rd shot drops. Looking for fun competitive energy!"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs shadow-md shadow-teal-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post to Club Board</span>
            </button>
          </div>
        </form>
      )}

      {/* Skill Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-zinc-400 whitespace-nowrap">Filter Skill:</span>
        {['all', '2.5', '3.0', '3.5', '4.0'].map(skill => (
          <button
            key={skill}
            type="button"
            onClick={() => setFilterSkill(skill)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterSkill === skill
                ? 'bg-teal-500 text-zinc-950 shadow-sm'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {skill === 'all' ? 'All Ratings' : `${skill}+ DUPR`}
          </button>
        ))}
      </div>

      {/* Challenges List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredChallenges.map(challenge => {
          const isFull = challenge.spotsNeeded <= 0;

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isFull
                  ? 'bg-zinc-900/40 border-zinc-800/80 opacity-75'
                  : 'bg-zinc-900/90 border-zinc-700/80 hover:border-teal-500/50 shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{challenge.format}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                        {challenge.targetSkill}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{challenge.time}</span>
                      <span>•</span>
                      <span>{challenge.courtName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
                        isFull
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>{isFull ? 'Game Full' : `${challenge.spotsNeeded} spot left`}</span>
                    </span>
                  </div>
                </div>

                {/* Match Note */}
                <p className="mt-3 text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                  "{challenge.note}"
                </p>

                {/* Roster list */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                    Confirmed Lineup:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {challenge.joinedPlayers.map((player, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700"
                      >
                        {player}
                      </span>
                    ))}
                    {Array.from({ length: challenge.spotsNeeded }).map((_, idx) => (
                      <span
                        key={`empty-${idx}`}
                        className="text-[11px] font-semibold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-lg border border-dashed border-zinc-700"
                      >
                        + Open Spot
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="text-[11px] text-zinc-400">
                  Host: <span className="font-bold text-zinc-200">{challenge.hostName}</span>
                </div>

                {!isFull ? (
                  <button
                    type="button"
                    onClick={() => handleJoinChallenge(challenge.id)}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs shadow-md shadow-teal-500/20 transition active:scale-95 flex items-center gap-1"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Join Match</span>
                  </button>
                ) : (
                  <span className="text-xs text-zinc-500 font-bold">Roster Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
