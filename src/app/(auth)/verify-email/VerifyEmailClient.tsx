"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred.");
      }
    };

    verify();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-8 h-8 text-tc-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-muted-foreground font-medium">Verifying your email address...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
        <p className="text-muted-foreground max-w-sm mb-4">Your email has been successfully verified. You now have full access to TwineCord.</p>
        <Link href="/discover" className="px-6 py-3 bg-tc-primary hover:bg-tc-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-tc-primary/20">
          Continue to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-2">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </div>
      <h2 className="text-2xl font-bold text-foreground">Verification Failed</h2>
      <p className="text-muted-foreground max-w-sm mb-4">{message}</p>
      <Link href="/login" className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-foreground font-semibold rounded-xl transition-all">
        Back to Login
      </Link>
    </div>
  );
}
