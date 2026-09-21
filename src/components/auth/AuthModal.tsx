import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Trophy,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    resetPassword,
    setIsStaffLoginModalOpen,
  } = useApp();

  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSkillLevel, setRegSkillLevel] = useState('3.0 - 3.5 Intermediate');

  // Reset fields
  const [resetContact, setResetContact] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailOrPhone.trim() || !password) {
      setErrorMsg('Please enter both your email/phone and password.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(emailOrPhone, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        // clear and close
        setEmailOrPhone('');
        setPassword('');
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        skillLevel: regSkillLevel,
      });
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
      }
    }, 500);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!resetContact.trim() || !newPassword) {
      setErrorMsg('Please provide your registered contact and new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = resetPassword(resetContact, newPassword);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg('Password updated! Redirecting to login...');
        setTimeout(() => {
          setSuccessMsg('');
          openAuthModal('login');
        }, 1500);
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setEmailOrPhone('pratishgupta22@gmail.com');
    setPassword('password123');
    setTimeout(() => {
      login('pratishgupta22@gmail.com', 'password123');
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
              CC
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-100 tracking-tight leading-none">
                Court & Cafe
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Member Club Access Pass</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        {authModalMode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 m-5 bg-zinc-950/60 rounded-xl border border-zinc-800 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                openAuthModal('login');
              }}
              className={`py-2 px-3 rounded-lg transition-all text-center ${
                authModalMode === 'login'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                openAuthModal('register');
              }}
              className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                authModalMode === 'register'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Register</span>
              <span className="text-[10px] bg-emerald-950/40 text-emerald-200 font-semibold px-1.5 py-0.5 rounded-full">
                +₹100 Free
              </span>
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mx-6 mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Email or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  placeholder="Enter email address or phone number"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    openAuthModal('forgot');
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Member Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo 1-Click Login */}
            <div className="pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2 px-3 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-zinc-300 text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Tap Demo Login (Pratish Gupta • Regular Member)</span>
              </button>
            </div>

            <p className="text-center text-xs text-zinc-400 pt-1">
              New to Court & Cafe?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Create an account
              </button>
            </p>
          </form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="px-6 pb-6 space-y-3.5">
            {/* Joining Incentive Badge */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-emerald-300">Welcome Member Credit: ₹100</div>
                <div className="text-zinc-400">Instantly credited to your wallet for court reservations & cafe treats.</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Mobile (+91)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="98200 12345"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                Pickleball Skill Rating
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Trophy className="w-4 h-4" />
                </div>
                <select
                  value={regSkillLevel}
                  onChange={e => setRegSkillLevel(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500 text-sm"
                >
                  <option value="2.0 - 2.5 Novice / Beginner">2.0 - 2.5 Novice / Beginner (Learning dinks)</option>
                  <option value="3.0 - 3.5 Intermediate">3.0 - 3.5 Intermediate (Consistent rallies)</option>
                  <option value="4.0+ Advanced / Tournament Pro">4.0+ Advanced (DUPR Rated / Match Play)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Membership...' : 'Register & Claim ₹100 Credit'}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-[11px] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Digital Court Pass • Valid on iOS Safari & Android</span>
            </div>
          </form>
        )}

        {/* ================= FORGOT PASSWORD FORM ================= */}
        {authModalMode === 'forgot' && (
          <form onSubmit={handleResetSubmit} className="px-6 pb-6 space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-zinc-100">Reset Member Password</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your registered email or phone to set a new password.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Registered Contact
              </label>
              <input
                type="text"
                value={resetContact}
                onChange={e => setResetContact(e.target.value)}
                placeholder="pratishgupta22@gmail.com or 9845067123"
                className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter at least 6 characters"
                className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Save New Password & Log In'}
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 text-center"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* Staff & Owner Alternate Access */}
        <div className="px-6 py-3 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Club Staff or Owner?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              closeAuthModal();
              setIsStaffLoginModalOpen(true);
            }}
            className="font-bold text-amber-400 hover:text-amber-300 transition"
          >
            Staff ID & PIN Login &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
