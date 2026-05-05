"use client";

import { useState, useEffect } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-slate-500">Loading users...</div>;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-slate-500 mt-1">Manage all registered users on the platform.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map(user => (
                <UserRow key={user.id} user={user} onUpdate={(updated) => {
                  setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
                }} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [busy, setBusy] = useState(false);

  const toggleShadowban = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/shadowban`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        onUpdate({ id: user.id, isShadowbanned: data.isShadowbanned });
      }
    } catch (err) { console.error(err); }
    finally { setBusy(false); }
  };

  const toggleSuspend = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/suspend`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        onUpdate({ id: user.id, status: data.status });
      }
    } catch (err) { console.error(err); }
    finally { setBusy(false); }
  };

  const togglePremium = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/premium`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        onUpdate({ id: user.id, isPremium: data.isPremium });
      }
    } catch (err) { console.error(err); }
    finally { setBusy(false); }
  };

  const toggleBoost = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/boost`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        onUpdate({ id: user.id, isBoosted: data.isBoosted });
      }
    } catch (err) { console.error(err); }
    finally { setBusy(false); }
  };

  return (
    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${user.isShadowbanned ? 'opacity-50' : ''}`}>
      <td className="px-6 py-4">
        <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {user.name || "Unnamed"}
          {user.isShadowbanned && (
            <span className="bg-gray-800 text-gray-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Shadowbanned</span>
          )}
          {user.isBoosted && !user.isShadowbanned && (
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Boosted</span>
          )}
        </div>
        <div className="text-slate-500">{user.email}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4">
        {user.isPremium ? (
          <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Premium</span>
        ) : (
          <span className="text-slate-500 text-xs">Free</span>
        )}
      </td>
      <td className="px-6 py-4 text-slate-500">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <button
            onClick={togglePremium}
            disabled={busy}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-50"
          >
            {user.isPremium ? "Revoke Premium" : "Grant Premium"}
          </button>
          <button
            onClick={toggleBoost}
            disabled={busy}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50"
          >
            {user.isBoosted ? "Remove Boost" : "Boost Algorithm"}
          </button>
          <button
            onClick={toggleShadowban}
            disabled={busy}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            {user.isShadowbanned ? "Un-Shadow" : "Shadowban"}
          </button>
          <button
            onClick={toggleSuspend}
            disabled={busy}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            {user.status === "ACTIVE" ? "Suspend" : "Reinstate"}
          </button>
        </div>
      </td>
    </tr>
  );
}
