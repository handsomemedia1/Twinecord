"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type RequestType = {
  id: string;
  answerToReview: string | null;
  createdAt: string;
  sender: {
    id: string;
    isPremium: boolean;
    profile: {
      displayName: string;
      city: string | null;
      state: string | null;
      photos: string; // JSON string
    } | null;
  };
};

type MatchType = {
  id: string;
  createdAt: string;
  otherUser: {
    id: string;
    isPremium: boolean;
    profile: {
      displayName: string;
      photos: string; // JSON string
    } | null;
  };
};

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "matches">("pending");
  const [pendingRequests, setPendingRequests] = useState<RequestType[]>([]);
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.pendingRequests);
        setMatches(data.matches);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (requestId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/requests/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        // Remove from pending list locally to feel snappy
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        if (status === "ACCEPTED") {
          // Re-fetch to update active matches
          fetchData();
        }
      } else {
        alert("Failed to process request.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-tc-primary"><svg className="animate-spin w-8 h-8" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-6 text-foreground">Inbox</h1>
        
        {/* TABS */}
        <div className="flex bg-secondary/50 p-1 rounded-xl w-full max-w-sm mb-8">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "pending" ? "bg-white text-tc-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Pending Requests {pendingRequests.length > 0 && <span className="ml-1 bg-tc-primary text-white px-1.5 py-0.5 rounded-full text-xs">{pendingRequests.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab("matches")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "matches" ? "bg-white text-tc-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Mutual Matches {matches.length > 0 && <span className="ml-1 bg-secondary text-foreground px-1.5 py-0.5 rounded-full text-xs">{matches.length}</span>}
          </button>
        </div>
      </div>

      {/* TAB CONTENT: PENDING REQUESTS */}
      {activeTab === "pending" && (
        <div className="animate-fade-in space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-card p-12 rounded-3xl border border-border text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-tc-primary/10 rounded-full flex items-center justify-center text-tc-primary mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
              <p className="text-muted-foreground text-sm max-w-sm">When someone finds your profile and answers your Review Question, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 border-b border-border flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary rounded-full relative overflow-hidden flex-shrink-0">
                      <Image src="/couple-photo.png" alt="Profile" fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold flex items-center gap-2">
                        {req.sender.profile?.displayName || "Unknown"}
                        {req.sender.isPremium && <svg className="w-4 h-4 text-tc-gold" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2l2.5 5.5L18 8l-4 4.5 1 6-5-3-5 3 1-6-4-4.5 5.5-.5L10 2z" clipRule="evenodd" /></svg>}
                      </h4>
                      <p className="text-xs text-muted-foreground">{req.sender.profile?.city}, {req.sender.profile?.state}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-tc-blush/30">
                    <div className="text-xs font-bold text-tc-primary mb-1 uppercase tracking-wider">Their Answer to your question:</div>
                    <p className="text-sm font-medium italic text-foreground">"{req.answerToReview || "No answer provided."}"</p>
                  </div>
                  <div className="p-3 flex gap-2 border-t border-border bg-card">
                    <button 
                      onClick={() => handleRespond(req.id, "REJECTED")}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => handleRespond(req.id, "ACCEPTED")}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold bg-tc-primary hover:bg-tc-primary-dark text-white shadow-md shadow-tc-primary/20 transition-all active:scale-95"
                    >
                      Accept Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MUTUAL MATCHES */}
      {activeTab === "matches" && (
        <div className="animate-fade-in">
          {matches.length === 0 ? (
            <div className="bg-card p-12 rounded-3xl border border-border text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-tc-primary/10 rounded-full flex items-center justify-center text-tc-primary mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No mutual matches yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Keep discovering and answering Review Questions to find your cord.</p>
              <Link href="/discover" className="mt-6 btn-app-primary text-sm px-6">Go to Discover</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {matches.map(match => (
                <div key={match.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer relative">
                  <div className="aspect-square bg-secondary relative">
                    <Image src="/couple-photo.png" alt="Match" fill className="object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-bold text-sm truncate flex items-center gap-1">
                        {match.otherUser.profile?.displayName}
                        {match.otherUser.isPremium && <svg className="w-3 h-3 text-tc-gold flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2l2.5 5.5L18 8l-4 4.5 1 6-5-3-5 3 1-6-4-4.5 5.5-.5L10 2z" clipRule="evenodd" /></svg>}
                      </h4>
                    </div>
                  </div>
                  <div className="p-3 bg-card">
                    <Link href={`/messages`} className="w-full py-1.5 flex justify-center items-center gap-1.5 text-xs font-semibold text-tc-primary bg-tc-primary/10 rounded-lg hover:bg-tc-primary hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Message
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
