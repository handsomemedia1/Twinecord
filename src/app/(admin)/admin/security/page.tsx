"use client";

import { useState, useEffect } from "react";

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/security");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-slate-500">Loading security logs...</div>;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Audit Logs</h1>
        <p className="text-slate-500 mt-1">Immutable record of critical authentication and profile events.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${
                      log.action.includes('LOGIN') ? 'bg-blue-100 text-blue-700' :
                      log.action.includes('SIGNUP') ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {log.user?.email || log.userId}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-xs" title={log.userAgent}>
                    {log.userAgent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No security logs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
