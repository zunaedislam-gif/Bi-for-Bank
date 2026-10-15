import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Unlock,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building,
  Phone,
  CreditCard,
  Search,
  Filter,
  FileText,
  UserCheck,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/banking.js';

interface UserManagementViewProps {
  currentUser: AuthUser;
  onSwitchUser?: (user: AuthUser) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onSwitchUser,
}) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'register' | 'audit' | 'matrix'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    role: 'manager' as UserRole,
    branchId: 'BR-101',
    phone: '+88017',
    nidNumber: '',
    password: '',
    forcePasswordReset: true,
    kycVerified: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<AuthUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const canRegisterUsers = currentUser.role === 'admin' || currentUser.role === 'manager';
  const isAdmin = currentUser.role === 'admin';

  const branchOptions = [
    { id: 'BR-101', name: 'Motijheel Flagship (BR-101) - Dhaka Central' },
    { id: 'BR-102', name: 'Gulshan Corporate (BR-102) - Dhaka North' },
    { id: 'BR-201', name: 'Agrabad Commercial (BR-201) - Chattogram' },
    { id: 'BR-202', name: 'Khatunganj Trade (BR-202) - Chattogram' },
    { id: 'BR-301', name: 'Uttara Model Town (BR-301) - Dhaka West' },
    { id: 'BR-302', name: 'Mirpur Retail Hub (BR-302) - Dhaka West' },
    { id: 'BR-401', name: 'Rajshahi Division (BR-401) - North' },
    { id: 'BR-402', name: 'Bogura Industrial (BR-402) - North' },
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [uRes, aRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/auth/audit-logs'),
      ]);
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAuditLogs(aData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Bk@';
    for (let i = 0; i < 9; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      setFormError('Please fill all mandatory fields: Full Name, Corporate Email, Username, and Password.');
      return;
    }

    if (!formData.kycVerified) {
      setFormError('Please confirm KYC verification and employee background validation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create internal user.');
        return;
      }

      showToast(`User ${formData.fullName} successfully registered in BankBI core system.`);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        username: '',
        role: 'manager',
        branchId: 'BR-101',
        phone: '+88017',
        nidNumber: '',
        password: '',
        forcePasswordReset: true,
        kycVerified: true,
      });
      setActiveSubTab('users');
      await fetchUsers();
    } catch (err: any) {
      setFormError('Network error while provisioning user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (userId: string, currentLock: number) => {
    if (!isAdmin) {
      showToast('Only System Administrators can toggle account lock status.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/auth/users/${userId}/lock`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`User security lock status updated.`);
        fetchUsers();
      }
    } catch (err) {
      showToast('Failed to toggle lock status.', 'error');
    }
  };

  const handleToggleActive = async (userId: string, currentActive: number) => {
    if (!isAdmin) {
      showToast('Only System Administrators can activate or deactivate accounts.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/auth/users/${userId}/active`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`User active status updated.`);
        fetchUsers();
      }
    } catch (err) {
      showToast('Failed to toggle active status.', 'error');
    }
  };

  const handleExecutePasswordReset = async () => {
    if (!resetModalUser || !newPasswordInput) return;
    try {
      const res = await fetch(`/api/auth/users/${resetModalUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordInput }),
      });
      if (res.ok) {
        showToast(`Password successfully reset for ${resetModalUser.full_name}.`);
        setResetModalUser(null);
        setNewPasswordInput('');
        fetchUsers();
      }
    } catch (err) {
      showToast('Failed to reset password.', 'error');
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Admin</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Manager</span>;
      case 'auditor':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Auditor</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Customer</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
              : 'bg-rose-950 text-rose-100 border-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Banking Security &amp; RBAC Control</span>
            <span aria-hidden="true">·</span>
            <span>Internal Provisioning Only</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Internal User Management &amp; Staff Registration
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            In compliance with Bangladesh Bank BRPD regulations, public self-registration is disabled.
            Authorized Administrators and Branch Managers register internal officers, managers, auditors, and customer portfolios.
          </p>
        </div>

        {canRegisterUsers && (
          <button
            onClick={() => setActiveSubTab('register')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Register New Internal User</span>
          </button>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Users</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{users.length}</span>
          <span className="text-[10px] text-slate-400">All provisioned staff</span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Active Accounts</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {users.filter((u) => u.is_active === 1).length}
          </span>
          <span className="text-[10px] text-slate-400">Can authenticate</span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Locked Accounts</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">
            {users.filter((u) => u.is_locked === 1).length}
          </span>
          <span className="text-[10px] text-slate-400">Security lockouts</span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Administrators</span>
          <span className="text-2xl font-bold text-indigo-700 mt-1 block">
            {users.filter((u) => u.role === 'admin').length}
          </span>
          <span className="text-[10px] text-slate-400">Full system authority</span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Managers &amp; Auditors</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {users.filter((u) => u.role === 'manager' || u.role === 'auditor').length}
          </span>
          <span className="text-[10px] text-slate-400">Branch &amp; compliance</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold text-slate-600 gap-6">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`py-3 relative cursor-pointer transition-colors ${
            activeSubTab === 'users' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'
          }`}
        >
          Staff &amp; User Directory ({users.length})
        </button>
        {canRegisterUsers && (
          <button
            onClick={() => setActiveSubTab('register')}
            className={`py-3 relative cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'register' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Register New User (Internal)</span>
          </button>
        )}
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`py-3 relative cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'audit' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-600" />
          <span>Security &amp; Auth Audit Logs ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`py-3 relative cursor-pointer transition-colors ${
            activeSubTab === 'matrix' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'
          }`}
        >
          RBAC Permissions Matrix
        </button>
      </div>

      {/* SUB-TAB 1: USER DIRECTORY */}
      {activeSubTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-500 font-medium">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="ALL">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="auditor">Auditor</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">User &amp; ID</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Assigned Branch</th>
                  <th className="py-2.5 px-3">Contact &amp; NID</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Login</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No internal users matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{u.full_name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 text-[10px] bg-indigo-100 text-indigo-800 rounded font-normal">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {u.email} · <span className="text-slate-400">{u.username}</span> ({u.id})
                          </div>
                        </td>
                        <td className="py-3 px-3">{roleBadge(u.role)}</td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {u.branch_id || 'All Branches (HQ)'}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                          <div>{u.phone || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400">NID: {u.nid_number || 'Verified'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            {u.is_active === 1 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Deactivated
                              </span>
                            )}
                            {u.is_locked === 1 && (
                              <span className="block text-[10px] font-bold text-rose-600 uppercase">
                                Locked (5 Bad Att.)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {u.last_login_at
                            ? new Date(u.last_login_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Never'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Switch to this user for evaluation */}
                            {onSwitchUser && !isSelf && (
                              <button
                                onClick={() => onSwitchUser(u)}
                                title="Log in as this user to test their permissions"
                                className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors cursor-pointer"
                              >
                                Test Login
                              </button>
                            )}

                            {/* Lock/Unlock Toggle (Admin only) */}
                            {isAdmin && !isSelf && (
                              <button
                                onClick={() => handleToggleLock(u.id, u.is_locked)}
                                title={u.is_locked ? 'Unlock Account' : 'Lock Account'}
                                className={`p-1 rounded cursor-pointer transition-colors ${
                                  u.is_locked
                                    ? 'text-rose-600 hover:bg-rose-50'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {u.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {/* Reset Password Button */}
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setResetModalUser(u);
                                  setNewPasswordInput('Bank@2026');
                                }}
                                title="Reset User Password"
                                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Deactivate/Activate Toggle */}
                            {isAdmin && !isSelf && (
                              <button
                                onClick={() => handleToggleActive(u.id, u.is_active)}
                                title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                              >
                                {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REGISTER NEW INTERNAL USER */}
      {activeSubTab === 'register' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-3xl">
          <div className="mb-5 pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Internal Bank Staff &amp; Customer Registration Form</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorized creation of system accounts. Public self-registration is strictly prohibited under central banking KYC guidelines.
            </p>
          </div>

          {formError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Officer / Customer Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahfuzur Rahman"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Corporate Email */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. mahfuzur@bank.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Login Username *
                </label>
                <input
                  type="text"
                  placeholder="e.g. mahfuz_mgr"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  System Role &amp; Access Tier *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="manager">Branch Operations Manager</option>
                  <option value="auditor">Internal Auditor (Compliance)</option>
                  <option value="customer">Bank Customer / Credit Officer</option>
                  {isAdmin && <option value="admin">System Administrator</option>}
                </select>
              </div>

              {/* Assigned Branch */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Branch Entity *
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  {branchOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Phone / Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="+8801711..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* NID */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  National ID (NID) / Employee Clearance No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. 19912691234567890"
                  value={formData.nidNumber}
                  onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Password with generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Initial Password *</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    Generate Strong Password
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter initial password (e.g. Bk@9xLp4#)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Compliance Declarations */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2 mt-4">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.kycVerified}
                  onChange={(e) => setFormData({ ...formData, kycVerified: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0 mt-0.5"
                />
                <span className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>KYC &amp; AML Compliance Declaration:</strong> I hereby certify that this user's identity, national credentials (NID), and employment status have been verified against Bangladesh Bank regulatory standards.
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.forcePasswordReset}
                  onChange={(e) => setFormData({ ...formData, forcePasswordReset: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                />
                <span className="text-slate-700 text-[11px]">
                  Enforce mandatory password reset on initial sign-in.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Registering in Bank Core...' : 'Provision User Account'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('users')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: SECURITY AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Authentication &amp; Security Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable records of user sign-in events, password evaluations, account lockouts, and provisioning actions
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Rule / Event</th>
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">Audit Details</th>
                  <th className="py-2.5 px-3">Action Taken</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No security audit events recorded.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.severity === 'ERROR'
                              ? 'bg-rose-50 text-rose-700'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{log.rule_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{log.record_id}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{log.action_taken}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {log.created_at || 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RBAC PERMISSIONS MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Banking RBAC Access Matrix &amp; Authority Hierarchy
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Resource and action entitlement breakdown across the 4 banking role personas
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-semibold bg-slate-50">
                  <th className="py-3 px-4">Resource / Workflow</th>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Manager</th>
                  <th className="py-3 px-4">Auditor</th>
                  <th className="py-3 px-4">Customer / Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-4 font-semibold">Executive Dashboard &amp; Macro KPIs</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Full Access</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Full Access</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Read Only</td>
                  <td className="py-2.5 px-4 text-slate-400">Restricted</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">Register Internal Users (No Public Reg.)</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">All Roles</td>
                  <td className="py-2.5 px-4 text-indigo-600 font-semibold">Staff &amp; Customers</td>
                  <td className="py-2.5 px-4 text-slate-400">Forbidden</td>
                  <td className="py-2.5 px-4 text-slate-400">Forbidden</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">Lock / Unlock Account Security</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Permitted</td>
                  <td className="py-2.5 px-4 text-slate-400">Forbidden</td>
                  <td className="py-2.5 px-4 text-slate-400">Forbidden</td>
                  <td className="py-2.5 px-4 text-slate-400">Forbidden</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">Security &amp; Auth Audit Logs Inspection</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Full Audit View</td>
                  <td className="py-2.5 px-4 text-slate-400">Limited</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Full Audit View</td>
                  <td className="py-2.5 px-4 text-slate-400">Forbidden</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">CSV / Power BI Data Extraction</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Permitted</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Permitted</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Permitted</td>
                  <td className="py-2.5 px-4 text-slate-400">Own Statement Only</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">Branch Capital Stress Testing</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Permitted</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Permitted</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-semibold">Simulation Mode</td>
                  <td className="py-2.5 px-4 text-slate-400">Forbidden</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reset Password for {resetModalUser.full_name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                User ID: {resetModalUser.id} · Email: {resetModalUser.email}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Temporary Password
              </label>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResetModalUser(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePasswordReset}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
