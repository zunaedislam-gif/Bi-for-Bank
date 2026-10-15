import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Building,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AuthUser } from '../types/banking.js';

interface BankingLoginViewProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export const BankingLoginView: React.FC<BankingLoginViewProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('admin@bank.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const demoAccounts = [
    {
      role: 'admin',
      roleLabel: 'System Administrator',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      identifier: 'admin@bank.com',
      password: 'Admin@123',
      name: 'Syed Nazmul Islam',
      branch: 'Head Office IT & Sec',
      desc: 'Full administrative authority, internal user registration, audit logs & system controls',
    },
    {
      role: 'manager',
      roleLabel: 'Branch Operations Manager',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      identifier: 'manager@bank.com',
      password: 'Manager@123',
      name: 'Tariqul Rahman',
      branch: 'Motijheel Main Branch (BR-101)',
      desc: 'Branch operational metrics, credit approvals, register internal staff & customer accounts',
    },
    {
      role: 'auditor',
      roleLabel: 'Compliance & Risk Auditor',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      identifier: 'auditor@bank.com',
      password: 'Auditor@123',
      name: 'Nusrat Jahan',
      branch: 'Internal Audit & Vigilance',
      desc: 'Read-only compliance inspection, data quality audit trails, Basel II risk classification',
    },
    {
      role: 'customer',
      roleLabel: 'Bank Customer / Officer',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      identifier: 'customer1@bank.com',
      password: 'Cust@123',
      name: 'Rezaul Karim',
      branch: 'Motijheel Retail Portfolio',
      desc: 'Individual accounts, credit facility summaries, restricted to own branch/portfolio',
    },
  ];

  const handleSelectDemo = (demo: typeof demoAccounts[0]) => {
    setIdentifier(demo.identifier);
    setPassword(demo.password);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both corporate identifier and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Authentication rejected. Please verify credentials.');
        return;
      }

      // Persist session if remember me is set
      if (rememberMe) {
        localStorage.setItem('bankbi_auth_user', JSON.stringify(data.user));
        localStorage.setItem('bankbi_auth_token', data.token);
      } else {
        sessionStorage.setItem('bankbi_auth_user', JSON.stringify(data.user));
        sessionStorage.setItem('bankbi_auth_token', data.token);
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage('Unable to connect to BankBI core authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Banking Compliance Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-300">BankBI Enterprise Security Gateway</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Internal Core Banking System</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Bangladesh Bank BRPD Circular 14 Compliant</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>TLS 1.3 / 256-bit Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left Col: Institutional Context & KYC Mandate */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Strict Access Control &amp; Role Governance</span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded bg-indigo-600 flex items-center justify-center text-white font-black text-lg tracking-tight shadow-lg shadow-indigo-600/30">
                BI
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                BankBI Intelligence Portal
              </h1>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mt-2">
              Decision support and performance analytics cockpit for commercial banks.
              Designed for executive management, branch leaders, credit risk underwriters, and regulatory auditors.
            </p>
          </div>

          {/* Strict Compliance Notice - No Public Self-Registration */}
          <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Strict Policy: Public Self-Registration Is Prohibited</span>
            </div>
            <p className="text-amber-200/90 leading-relaxed text-[11px]">
              In accordance with central banking KYC and anti-money laundering regulations, this internal banking portal does <strong>not</strong> permit public self-registration.
              All officer, branch manager, auditor, and customer accounts are provisioned exclusively through authorized Bank Administrators inside the application.
            </p>
          </div>

          {/* Quick Pre-Seeded Banking Accounts Selector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Select Seed Role Account to Test:
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Click to autofill credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => handleSelectDemo(d)}
                  className={`p-3 rounded border text-left transition-all cursor-pointer ${
                    identifier === d.identifier
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-sm ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-white truncate">{d.roleLabel}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {d.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium truncate">{d.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{d.branch}</div>
                  <div className="text-[10px] font-mono text-indigo-400/90 mt-1 truncate">
                    {d.identifier}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Banking Login Card */}
        <div className="w-full lg:w-5/12 max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Staff Sign In</h2>
                <p className="text-xs text-slate-400 mt-0.5">Enter authorized banking credentials</p>
              </div>
              <div className="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-slate-300">
                <Lock className="w-4 h-4 text-indigo-400" />
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs rounded-lg flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Corporate Identifier */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate Email or Officer Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin@bank.com or sysadmin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500">Bcrypt Protected</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Session Preferences & Policy */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Persist session</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">15m idle auto-lock</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Banking Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to BankBI Core</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Internal User Provisioning Note */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <div className="text-[11px] text-slate-400">
                Need a new user account?
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Log in as <strong>Admin</strong> or <strong>Manager</strong> to access the internal <span className="text-indigo-400 font-medium">User Management &amp; Registration</span> dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            BankBI Decision Support System · Final Year CSE Portfolio Project · Bangladesh Banking Sector
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Internal Use Only · Unauthorized Access Strictly Prohibited
          </div>
        </div>
      </footer>
    </div>
  );
};
