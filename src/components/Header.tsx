import React from 'react';
import {
  Download,
  Database,
  ShieldCheck,
  User,
  LogOut,
  Users,
  Building,
  KeyRound,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AuthUser } from '../types/banking.js';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExportClick: () => void;
  currentUser: AuthUser | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportClick,
  currentUser,
  onSignOut,
}) => {
  const navItems = [
    { id: 'overview', label: 'Executive Overview' },
    { id: 'branches', label: 'Branch Analytics' },
    { id: 'deposits', label: 'Deposit Trends' },
    { id: 'loans', label: 'Loan Portfolio' },
    { id: 'customers', label: 'Customer Insights' },
    { id: 'data-quality', label: 'Data Quality' },
    { id: 'reports', label: 'Power BI & Export' },
    {
      id: 'user-management',
      label: 'Staff & Registration',
      highlight: true,
      badge: currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'manager' ? 'Register' : undefined,
    },
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">Admin</span>;
      case 'manager':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">Manager</span>;
      case 'auditor':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Auditor</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">Customer</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand Wordmark & Core Engine Status */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-black text-sm tracking-tight shadow-sm">
                BI
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('overview');
                }}
                className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors"
              >
                BankBI
              </a>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Core DB: Active</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>8 Branches</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-slate-900 font-bold'
                      : 'hover:text-slate-900 text-slate-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: User Profile, Actions & Sign Out */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                {/* User Info Capsule */}
                <div className="hidden sm:flex flex-col text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-slate-900 max-w-[140px] truncate">
                      {currentUser.full_name}
                    </span>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">
                    {currentUser.branch_id || 'Head Office (HQ)'} · {currentUser.username}
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={onSignOut}
                  title="Sign out of banking session"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : null}

            {/* Export CSV Button */}
            <button
              onClick={onExportClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              title="Download clean aggregate banking dataset"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="lg:hidden flex overflow-x-auto py-2.5 gap-3 text-xs font-medium border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
