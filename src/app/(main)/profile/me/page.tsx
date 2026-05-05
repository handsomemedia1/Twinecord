"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";

export default function MyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // The settings endpoint conveniently returns the user's full profile
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = async (result: any) => {
    if (result.event === "success") {
      const secureUrl = result.info.secure_url;
      try {
        const res = await fetch("/api/profiles/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secureUrl })
        });
        if (res.ok) {
          fetchProfile(); // Refresh to see the new photo
        }
      } catch (err) {
        console.error("Failed to save photo:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-tc-primary">
        <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">Profile not found. Please complete onboarding.</p>
        <Link href="/onboarding" className="px-6 py-2 bg-tc-primary text-white rounded-xl font-bold">
          Go to Onboarding
        </Link>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-background border-x border-border pb-24 md:pb-0 animate-fade-in">
      
      {/* HEADER */}
      <div className="p-6 border-b border-border sticky top-0 bg-card/80 backdrop-blur-md z-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">This is how you appear to others.</p>
        </div>
        <CldUploadWidget uploadPreset="twinecord_preset" onSuccess={handleUploadSuccess}>
          {({ open }) => (
            <button 
              onClick={() => open()}
              className="text-sm font-bold bg-tc-primary text-white px-4 py-2 rounded-xl shadow-lg shadow-tc-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Add Photo
            </button>
          )}
        </CldUploadWidget>
      </div>

      <div className="p-6">
        {/* PREVIEW CARD */}
        <div className="relative w-full max-w-sm mx-auto aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl group border border-border">
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800">
             <Image 
                src={profile.photos && profile.photos.length > 0 ? profile.photos[profile.photos.length - 1] : "/couple-photo.png"} 
                alt="Profile photo" 
                fill 
                className="object-cover"
                priority
             />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Verification Badge */}
          {profile.verificationStatus === "VERIFIED" && (
            <div className="absolute top-6 right-6 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Verified
            </div>
          )}

          {/* Profile Details */}
          <div className="absolute bottom-0 left-0 w-full p-8 text-white">
            
            <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-1 shadow-sm">
              {profile.displayName}, {age}
            </h2>
            
            <div className="flex items-center gap-2 text-white/90 text-sm mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>{profile.city || "Somewhere"}, {profile.state || "Earth"}</span>
            </div>

            {/* Denomination Pill */}
            {(profile.denomination || profile.churchName) && (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-white/30 mb-4">
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                 <span>{profile.denomination} {profile.churchName ? `• ${profile.churchName}` : ""}</span>
              </div>
            )}

            {/* Bio */}
            <p className="text-sm text-white/80 leading-relaxed mb-6 line-clamp-3">
              {profile.bio || "No bio provided."}
            </p>

            {/* Love Philosophy / Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.interestTags && Array.isArray(profile.interestTags) && profile.interestTags.slice(0, 3).map((tag: string, i: number) => (
                <span key={i} className="bg-white/10 border border-white/20 text-white/90 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
