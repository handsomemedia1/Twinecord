"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PremiumContent() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const isPremium = session?.user?.isPremium;

  useEffect(() => {
    if (searchParams.get("success")) {
      alert("Payment successful! You are now a Premium member.");
      update(); // Refresh session
    }
    if (searchParams.get("canceled")) {
      alert("Payment was canceled.");
    }
  }, [searchParams, update]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initiate checkout.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-2">TwineCord Premium</h1>
        <p className="text-muted-foreground">Upgrade your experience and find intentional matches faster.</p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl max-w-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Current Plan</h2>
            <p className="text-tc-primary font-medium mt-1">
              {isPremium ? "Premium Membership" : "Basic Membership"}
            </p>
          </div>
          {isPremium && (
            <div className="bg-tc-gold/20 text-tc-gold px-4 py-2 rounded-full text-sm font-bold border border-tc-gold/30">
              Active
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${isPremium ? 'text-green-500' : 'text-muted-foreground'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>Unlimited Connections</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${isPremium ? 'text-green-500' : 'text-muted-foreground'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>Advanced Search Filters</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${isPremium ? 'text-green-500' : 'text-tc-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isPremium ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} /></svg>
            <span className={isPremium ? "" : "text-muted-foreground"}>See who liked you</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${isPremium ? 'text-green-500' : 'text-tc-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isPremium ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} /></svg>
            <span className={isPremium ? "" : "text-muted-foreground"}>3 Direct InMails per month</span>
          </div>
        </div>

        {!isPremium ? (
          <button 
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-tc-primary hover:bg-tc-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-tc-primary/20 flex justify-center items-center gap-2"
          >
            {isLoading ? "Loading..." : "Upgrade to Premium - $14.99/mo"}
          </button>
        ) : (
          <div className="bg-secondary p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">
              You are currently enjoying TwineCord Premium. To manage your subscription, please check your email for the Stripe billing portal link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PremiumSettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>}>
      <PremiumContent />
    </Suspense>
  );
}
