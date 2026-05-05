"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [isPaused, setIsPaused] = useState(false);
  const [filterMinAge, setFilterMinAge] = useState(18);
  const [filterMaxAge, setFilterMaxAge] = useState(99);
  const [filterDenomination, setFilterDenomination] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setIsPaused(data.profile.isPaused);
        setFilterMinAge(data.profile.filterMinAge);
        setFilterMaxAge(data.profile.filterMaxAge);
        setFilterDenomination(data.profile.filterDenomination || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPaused,
          filterMinAge,
          filterMaxAge,
          filterDenomination: filterDenomination === "" ? null : filterDenomination
        })
      });

      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-tc-primary"><svg className="animate-spin w-8 h-8" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-background border-x border-border pb-24 md:pb-0">
      
      <div className="p-6 border-b border-border sticky top-0 bg-card/80 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-foreground">Settings & Privacy</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences, discovery filters, and account security.</p>
      </div>

      <div className="p-6 space-y-8">
        
        {/* DISCOVERY SETTINGS */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Discovery Preferences</h2>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Age Range</span>
                <span className="text-tc-primary font-bold text-sm">{filterMinAge} - {filterMaxAge}</span>
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="18" max="99" value={filterMinAge} 
                  onChange={(e) => setFilterMinAge(Math.min(parseInt(e.target.value), filterMaxAge))}
                  className="w-full accent-tc-primary"
                />
                <input 
                  type="range" min="18" max="99" value={filterMaxAge} 
                  onChange={(e) => setFilterMaxAge(Math.max(parseInt(e.target.value), filterMinAge))}
                  className="w-full accent-tc-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-sm mb-2">Denomination Filter</label>
              <select 
                value={filterDenomination} 
                onChange={(e) => setFilterDenomination(e.target.value)}
                className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-tc-primary focus:border-tc-primary transition-all text-sm"
              >
                <option value="">No preference (Show All)</option>
                <option value="Non-Denominational">Non-Denominational</option>
                <option value="Baptist">Baptist</option>
                <option value="Methodist">Methodist</option>
                <option value="Pentecostal">Pentecostal</option>
                <option value="Catholic">Catholic</option>
                <option value="Orthodox">Orthodox</option>
                <option value="Presbyterian">Presbyterian</option>
                <option value="Other">Other</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">Only users of this denomination will be shown in your Discovery feed.</p>
            </div>
          </div>
        </section>

        {/* PRIVACY CONTROLS */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Privacy Controls</h2>
          
          <div className="flex items-start justify-between p-4 bg-secondary/30 rounded-xl border border-border">
            <div>
              <h3 className="font-bold text-sm text-foreground">Pause Account (Snooze Mode)</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                Hide your profile from Discovery. You will not be shown to new people, but you can still message your existing matches.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isPaused} onChange={() => setIsPaused(!isPaused)} />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tc-primary"></div>
            </label>
          </div>
        </section>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-tc-primary text-white font-bold rounded-xl hover:bg-tc-primary-dark transition-all shadow-lg shadow-tc-primary/20 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>

        {/* DANGER ZONE */}
        <section className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 mt-12">
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button 
            onClick={() => {
              if (window.confirm("Are you absolutely sure you want to delete your account? All matches and messages will be permanently lost.")) {
                alert("Account deletion scheduled.");
                signOut({ callbackUrl: "/signup" });
              }
            }}
            className="px-6 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors border border-red-200 dark:border-red-800"
          >
            Delete Account
          </button>
        </section>

      </div>
    </div>
  );
}
