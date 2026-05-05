"use client";

import { useState, useEffect } from "react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // DM Viewer State
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [escrowMessages, setEscrowMessages] = useState<any[]>([]);
  const [isEscrowLoading, setIsEscrowLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTranscript = async (matchId: string) => {
    setSelectedMatchId(matchId);
    setIsEscrowLoading(true);
    setEscrowMessages([]);
    try {
      // Re-using the standard message endpoint but as an admin (the backend would need to allow admins to bypass the match-ownership check. For this demo, we assume the admin endpoint handles it, but since we didn't build a specific admin message fetcher, we will mock the transcript viewer or we need to add an admin override to the message fetcher).
      // Let's create a dedicated admin transcript fetcher.
      const res = await fetch(`/api/admin/reports/transcript/${matchId}`);
      if (res.ok) {
        const data = await res.json();
        setEscrowMessages(data.messages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsEscrowLoading(false);
    }
  };

  if (isLoading) return <div className="text-slate-500">Loading reports...</div>;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100 flex gap-6">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trust & Safety Reports</h1>
          <p className="text-slate-500 mt-1">Review user complaints and manage DM Safety Escrow logs.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Reported User</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Escrow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-emerald-600">
                    {report.reporter?.profile?.displayName || report.reporter?.email}
                  </td>
                  <td className="px-6 py-4 font-medium text-rose-600">
                    {report.reported?.profile?.displayName || report.reported?.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md text-xs font-bold">
                      {report.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {report.matchId ? (
                      <button 
                        onClick={() => fetchTranscript(report.matchId!)}
                        className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Unlock Transcript
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No Chat Log</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No reports filed.
            </div>
          )}
        </div>
      </div>

      {/* DM TRANSCRIPT VIEWER PANEL */}
      {selectedMatchId && (
        <div className="w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col h-[calc(100vh-6rem)] sticky top-8">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-rose-50 dark:bg-rose-900/10">
            <div>
              <h3 className="font-bold text-rose-700 dark:text-rose-400">Escrow Unlocked</h3>
              <p className="text-xs text-slate-500">Match ID: {selectedMatchId.slice(-6)}</p>
            </div>
            <button onClick={() => setSelectedMatchId(null)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
            {isEscrowLoading ? (
              <p className="text-center text-sm text-slate-500 mt-10">Decrypting logs...</p>
            ) : escrowMessages.length === 0 ? (
              <p className="text-center text-sm text-slate-500 mt-10">No messages sent in this thread.</p>
            ) : (
              escrowMessages.map(msg => (
                <div key={msg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm">
                  <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                    <span>User: {msg.senderId.slice(-6)}</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{msg.content}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
             <button className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">
               Shadowban Offender
             </button>
          </div>
        </div>
      )}

    </div>
  );
}
