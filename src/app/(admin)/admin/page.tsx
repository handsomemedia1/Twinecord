"use client";

import { useState, useEffect } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-slate-500">Loading metrics...</div>;

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">High-level metrics for the TwineCord platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers || 0, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" },
          { label: "Premium Members", value: stats?.premiumUsers || 0, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/20" },
          { label: "Active Matches", value: stats?.totalMatches || 0, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
          { label: "Pending Requests", value: stats?.activeRequests || 0, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/20" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-500 mb-1">{stat.label}</h3>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-lg">Recent Signups</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {recentUsers.map(user => (
            <div key={user.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium flex items-center gap-2">
                  {user.name || "Unnamed"}
                  {user.isPremium && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Premium</span>}
                </p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="text-sm text-slate-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
