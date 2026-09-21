import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SocialMixer } from '../../types';
import {
  Users,
  Plus,
  Flame,
  Wallet,
  ShieldCheck,
  CheckCircle,
  Wind,
  Sun,
  Activity,
  Award,
  Zap,
  Clock,
  MapPin,
  X,
  CreditCard,
  Swords,
  Calendar,
} from 'lucide-react';
import { MatchmakingBoard } from './MatchmakingBoard';

interface Props {
  onBookCourt?: () => void;
  onOrderCafe?: () => void;
}

export const SocialMixersView: React.FC<Props> = ({ onBookCourt, onOrderCafe }) => {
  const {
    socialMixers,
    joinMixer,
    createMixer,
    currentUser,
    walletBalance,
    topUpWallet,
    courtLights,
  } = useApp();

  const [communityTab, setCommunityTab] = useState<'mixers' | 'challenges'>('mixers');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '2.5' | '3.5' | '4.0'>('all');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(500);

  // New mixer form
  const [newTitle, setNewTitle] = useState('');
  const [newCourt, setNewCourt] = useState('Court 1 - Center Court');
  const [newTime, setNewTime] = useState('18:00 - 19:30 Today');
  const [newSkill, setNewSkill] = useState<SocialMixer['skillLevel']>('3.0 - 3.5 Intermediate');
  const [newMaxPlayers, setNewMaxPlayers] = useState(4);

  const filteredMixers = socialMixers.filter(m => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === '2.5') return m.skillLevel.includes('2.5');
    if (selectedFilter === '3.5') return m.skillLevel.includes('3.5');
    if (selectedFilter === '4.0') return m.skillLevel.includes('4.0');
    return true;
  });

  const handlePostMixer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMixer({
      title: newTitle,
      courtName: newCourt,
      time: newTime,
      skillLevel: newSkill,
      maxPlayers: newMaxPlayers,
      hostName: currentUser?.name || 'Club Member',
    });
    setNewTitle('');
    setIsPostModalOpen(false);
  };

  const handleExecuteTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    topUpWallet(topUpAmount);
    setIsTopUpModalOpen(false);
  };

  const activeLightsCount = Object.values(courtLights).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      
      {/* Top Banner: Club Membership & Facility Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Member Digital Pass Wallet Card */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-zinc-900 via-emerald-950/30 to-zinc-900 border border-emerald-500/30 p-5 sm:p-6 relative overflow-hidden shadow-xl">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-extrabold text-base">
                  {(currentUser?.name || 'M').charAt(0)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">{currentUser?.name || 'Club Member'}</h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-zinc-950 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    DIAMOND TIER
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Member ID: <span className="font-mono text-emerald-400 font-semibold">{currentUser?.membershipId || 'DR-7749'}</span> • 10% Cafe Cash-back
                </p>
              </div>
            </div>

            {/* Wallet Balance & Top up */}
            <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800 px-4 py-2.5 rounded-xl">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Club Wallet</p>
                <p className="text-lg font-black text-white">₹{walletBalance}</p>
              </div>
              <button
                onClick={() => setIsTopUpModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Top Up</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4 text-zinc-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Guaranteed ₹500/hr Court Booking
              </span>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-4 h-4" />
                Priority Courtside Cafe Service
              </span>
            </div>
            <button
              onClick={onBookCourt}
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Book a Court Now</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Live Facility Conditions Widget */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Court Conditions
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" /> Temp
                </span>
                <p className="text-sm font-bold text-white mt-0.5">26°C Optimal</p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-855">
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-cyan-400" /> Wind / AC
                </span>
                <p className="text-sm font-bold text-white mt-0.5">Indoor Climate Controlled</p>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400">LED Floodlights:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {activeLightsCount}/4 Courts Lit (1000 Lux)
            </span>
          </div>
        </div>

      </div>

      {/* Sub-tab Switcher: Mixers vs Challenges */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-900/90 rounded-2xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setCommunityTab('mixers')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            communityTab === 'mixers'
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Club Social Mixers & Round Robins</span>
        </button>

        <button
          type="button"
          onClick={() => setCommunityTab('challenges')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            communityTab === 'challenges'
              ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>DUPR Matchmaker & Pickup Challenges</span>
        </button>
      </div>

      {communityTab === 'challenges' ? (
        <MatchmakingBoard onBookCourt={onBookCourt} />
      ) : (
        /* Community Match Finder Section */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Open Play & Match Finder
            </h2>
            <p className="text-xs text-zinc-400">
              Join open doubles games, meet club players, or recruit partners by DUPR rating.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Skill Filter Pills */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedFilter === 'all' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('2.5')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedFilter === '2.5' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400'
                }`}
              >
                2.5 Social
              </button>
              <button
                onClick={() => setSelectedFilter('3.5')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedFilter === '3.5' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400'
                }`}
              >
                3.5 Inter
              </button>
              <button
                onClick={() => setSelectedFilter('4.0')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedFilter === '4.0' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400'
                }`}
              >
                4.0+ DUPR
              </button>
            </div>

            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Post Match</span>
            </button>
          </div>
        </div>

        {/* Mixer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredMixers.map(mixer => {
            const isFull = mixer.currentPlayers >= mixer.maxPlayers;
            const spotsRemaining = mixer.maxPlayers - mixer.currentPlayers;

            return (
              <div
                key={mixer.id}
                className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                  mixer.isJoined
                    ? 'bg-gradient-to-b from-emerald-950/40 to-zinc-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      mixer.skillLevel.includes('4.0')
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : mixer.skillLevel.includes('3.5')
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    }`}>
                      {mixer.skillLevel}
                    </span>

                    {mixer.isJoined && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-zinc-950 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        You're In!
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">{mixer.title}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{mixer.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{mixer.courtName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hosted by <strong>{mixer.hostName}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-zinc-400">Players Joined</span>
                    <span className="font-bold text-white font-mono">
                      {mixer.currentPlayers} / {mixer.maxPlayers}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(mixer.currentPlayers / mixer.maxPlayers) * 100}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => joinMixer(mixer.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      mixer.isJoined
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                        : isFull
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {mixer.isJoined ? (
                      <span>Leave Match RSVP</span>
                    ) : isFull ? (
                      <span>Game Full</span>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Join Match ({spotsRemaining} spot{spotsRemaining > 1 ? 's' : ''} left)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

      {/* Post Match Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Post Open Play Match
              </h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostMixer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Match Title / Description
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Need 4th for Intermediate Doubles"
                  required
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Court Location
                </label>
                <select
                  value={newCourt}
                  onChange={e => setNewCourt(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Court 1 - Center Court Championship">Court 1 - Center Court Championship</option>
                  <option value="Court 2 - Pro Indoor Classic">Court 2 - Pro Indoor Classic</option>
                  <option value="Court 3 - Skyline Covered Pavilion">Court 3 - Skyline Covered Pavilion</option>
                  <option value="Court 4 - Elite Club Court">Court 4 - Elite Club Court</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    placeholder="e.g. 19:00 Tonight"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Max Players
                  </label>
                  <select
                    value={newMaxPlayers}
                    onChange={e => setNewMaxPlayers(Number(e.target.value))}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={4}>4 Players (Doubles)</option>
                    <option value={2}>2 Players (Singles)</option>
                    <option value={8}>8 Players (Mixer Clinic)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Target Skill Level
                </label>
                <select
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value as SocialMixer['skillLevel'])}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="2.5 All-Levels">2.5 All-Levels (Casual)</option>
                  <option value="3.0 - 3.5 Intermediate">3.0 - 3.5 Intermediate (Rallies & Dinks)</option>
                  <option value="4.0+ Advanced DUPR">4.0+ Advanced DUPR (Competitive)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md"
                >
                  Publish Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Up Wallet Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Top Up Club Wallet
              </h3>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTopUp} className="mt-4 space-y-4">
              <p className="text-xs text-zinc-400">
                Current balance: <strong className="text-white">₹{walletBalance}</strong>. 
                Club wallet credits can be used for 1-click court bookings and courtside cafe orders.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      topUpAmount === amt
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-500'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Add ₹{topUpAmount}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
