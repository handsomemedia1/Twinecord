"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type ProfileCandidate = {
  id: string;
  userId: string;
  displayName: string;
  dateOfBirth: string;
  city: string | null;
  state: string | null;
  denomination: string | null;
  bio: string | null;
  reviewQuestion: string | null;
  isReviewMandatory: boolean;
  interestTags: string[];
  photos: string[];
  user: {
    isPremium: boolean;
  };
};

export default function DiscoverPage() {
  const [candidates, setCandidates] = useState<ProfileCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [reviewAnswer, setReviewAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  
  // Block State
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/discover");
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCandidate = candidates[currentIndex];

  const handleNextCandidate = () => {
    setCurrentIndex((prev) => prev + 1);
    setShowConnectModal(false);
    setReviewAnswer("");
  };

  const handleSendRequest = async () => {
    if (!currentCandidate) return;
    
    if (currentCandidate.isReviewMandatory && !reviewAnswer.trim()) {
      alert("An answer is required to connect with this person.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: currentCandidate.userId, // userId is needed for requests, not profile id. Wait, the API assumes receiverId is user.id. So let's make sure id is userId in candidates.
          answerToReview: reviewAnswer
        })
      });

      if (res.ok) {
        alert("Connection Request Sent!");
        handleNextCandidate();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to send request");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!currentCandidate || !reportReason.trim() || isReporting) return;
    setIsReporting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedId: currentCandidate.userId,
          reason: reportReason
        })
      });

      if (res.ok) {
        alert("Report submitted successfully.");
        setShowReportModal(false);
        handleNextCandidate(); // Skip them after reporting
      } else {
        alert("Failed to submit report.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReporting(false);
    }
  };

  const handleBlock = async () => {
    if (!currentCandidate || isBlocking) return;
    
    if (!window.confirm(`Are you sure you want to block ${currentCandidate.displayName}? This is permanent and they will never be shown to you again.`)) return;

    setIsBlocking(true);
    try {
      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedId: currentCandidate.userId })
      });

      if (res.ok) {
        handleNextCandidate(); // Immediately remove them from view
      } else {
        alert("Failed to block user.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBlocking(false);
    }
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-tc-primary"><svg className="animate-spin w-8 h-8" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  if (!currentCandidate) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-tc-blush rounded-full flex items-center justify-center text-tc-primary mb-6">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-2">You've seen everyone!</h2>
        <p className="text-muted-foreground max-w-md">Check back later for more potential matches in your area who share your faith.</p>
      </div>
    );
  }

  // Calculate age
  const age = new Date().getFullYear() - new Date(currentCandidate.dateOfBirth).getFullYear();

  return (
    <div className="h-full max-w-lg mx-auto p-4 sm:p-8 flex flex-col relative">
      
      {/* CARD */}
      <div className="flex-1 relative bg-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-border group">
        
        {/* Placeholder Photo since we don't have Cloudinary yet */}
        <div className="absolute inset-0 bg-secondary flex items-center justify-center">
           <Image src="/couple-photo.png" alt="Profile" fill className="object-cover" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          {currentCandidate.user.isPremium && (
            <div className="mb-3 inline-flex items-center gap-1.5 bg-tc-gold/20 text-tc-gold border border-tc-gold/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2l2.5 5.5L18 8l-4 4.5 1 6-5-3-5 3 1-6-4-4.5 5.5-.5L10 2z" clipRule="evenodd" /></svg>
              Premium
            </div>
          )}
          
          <div className="flex justify-between items-start">
            <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-1 shadow-sm">
              {currentCandidate.displayName}, {age}
            </h2>
            <div className="flex gap-2">
              <button onClick={handleBlock} disabled={isBlocking} className="text-white/50 hover:text-slate-300 transition-colors p-2 disabled:opacity-50" title="Block Profile">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              </button>
              <button onClick={() => setShowReportModal(true)} className="text-white/50 hover:text-rose-500 transition-colors p-2" title="Report Profile">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-white/90 text-sm mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {currentCandidate.city}, {currentCandidate.state}
            <span className="opacity-50">•</span>
            {currentCandidate.denomination || "Christian"}
          </div>

          <p className="text-white/80 text-sm line-clamp-3 mb-6">
            {currentCandidate.bio || "Intentional about finding a God-centered relationship."}
          </p>

          {/* Love Philosophy / Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {currentCandidate.interestTags && Array.isArray(currentCandidate.interestTags) && currentCandidate.interestTags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="bg-white/10 border border-white/20 text-white/90 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleNextCandidate}
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 border border-white/20"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button 
              onClick={() => setShowConnectModal(true)}
              className="flex-1 rounded-full bg-tc-primary hover:bg-tc-primary-dark text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-tc-primary/40 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* CONNECTION MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-border bg-tc-blush/30">
              <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
                <svg className="w-5 h-5 text-tc-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                Connect with {currentCandidate.displayName}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {currentCandidate.reviewQuestion ? (
                <div className="bg-tc-primary/5 border border-tc-primary/20 rounded-2xl p-5 relative">
                  <div className="absolute -top-3 left-4 bg-card px-2 text-xs font-bold text-tc-primary uppercase tracking-wider">
                    Their Question
                  </div>
                  <p className="text-foreground font-medium italic mt-2">
                    "{currentCandidate.reviewQuestion}"
                  </p>
                  {currentCandidate.isReviewMandatory && (
                    <div className="mt-3 text-xs font-semibold text-destructive flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Mandatory to answer
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {currentCandidate.displayName} hasn't set a review question. You can include an optional message to stand out!
                </p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Your Answer</label>
                <textarea 
                  value={reviewAnswer}
                  onChange={(e) => setReviewAnswer(e.target.value)}
                  placeholder="Type your authentic response..." 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all resize-none h-32"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border bg-secondary/30 flex gap-3">
              <button 
                onClick={() => setShowConnectModal(false)}
                className="flex-1 px-4 py-3 font-semibold text-foreground bg-card hover:bg-secondary border border-border rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendRequest}
                disabled={isSubmitting || (currentCandidate.isReviewMandatory && !reviewAnswer.trim())}
                className="flex-[2] px-4 py-3 font-semibold text-white bg-tc-primary hover:bg-tc-primary-dark rounded-xl shadow-lg shadow-tc-primary/20 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-rose-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 className="text-lg font-bold text-foreground">Report Profile</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Does this profile violate TwineCord's community standards? Let us know so we can investigate.
            </p>
            <textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="e.g. Inappropriate photo, fake profile..."
              className="w-full px-4 py-3 border border-border rounded-xl bg-background mb-4 resize-none h-24 focus:ring-2 focus:ring-rose-500 outline-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-2 font-semibold text-foreground bg-secondary rounded-xl">Cancel</button>
              <button onClick={handleReport} disabled={isReporting || !reportReason.trim()} className="flex-1 py-2 font-semibold text-white bg-rose-600 rounded-xl disabled:opacity-50">Submit Report</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
