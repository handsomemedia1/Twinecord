"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    displayName: "",
    dateOfBirth: "",
    gender: "",
    city: "",
    state: "",
    denomination: "",
    churchName: "",
    baptized: "Yes",
    attendanceFreq: "Weekly",
    relationshipGoal: "Marriage",
    lovePhilosophy: "",
    reviewQuestion: "",
    isReviewMandatory: true,
  });

  const updateForm = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep((s) => Math.min(4, s + 1));
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save profile");
      }

      router.push("/discover");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while saving your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6">
      
      {/* Header & Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="TwineCord Logo" width={40} height={40} className="rounded-xl shadow-md" />
            <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-foreground">
              TwineCord
            </span>
          </div>
          <span className="text-sm font-semibold text-muted-foreground">Step {step} of 4</span>
        </div>

        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-tc-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-2xl bg-card border border-border shadow-2xl shadow-tc-primary/5 rounded-[2rem] p-6 sm:p-10 relative overflow-hidden">
        
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-foreground mb-2">Basic Information</h2>
              <p className="text-muted-foreground">Let's start with the essentials so matches know who you are.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Display Name</label>
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={(e) => updateForm("displayName", e.target.value)}
                  placeholder="What should we call you?" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Date of Birth</label>
                  <input 
                    type="date" 
                    value={formData.dateOfBirth}
                    onChange={(e) => updateForm("dateOfBirth", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => updateForm("gender", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">City</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    placeholder="e.g. Nashville" 
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">State</label>
                  <input 
                    type="text" 
                    value={formData.state}
                    onChange={(e) => updateForm("state", e.target.value)}
                    placeholder="e.g. TN" 
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Faith Profile */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-foreground mb-2">Your Faith Journey</h2>
              <p className="text-muted-foreground">Faith is the foundation of our platform. Share your walk with God.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Denomination / Background</label>
                <select 
                  value={formData.denomination}
                  onChange={(e) => updateForm("denomination", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all"
                >
                  <option value="">Select Denomination</option>
                  <option value="Non-Denominational">Non-Denominational</option>
                  <option value="Baptist">Baptist</option>
                  <option value="Catholic">Catholic</option>
                  <option value="Pentecostal">Pentecostal</option>
                  <option value="Methodist">Methodist</option>
                  <option value="Presbyterian">Presbyterian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Home Church (Optional)</label>
                <input 
                  type="text" 
                  value={formData.churchName}
                  onChange={(e) => updateForm("churchName", e.target.value)}
                  placeholder="Where do you worship?" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Have you been baptized?</label>
                  <div className="flex gap-4">
                    {["Yes", "No", "Planning To"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="baptized" checked={formData.baptized === opt} onChange={() => updateForm("baptized", opt)} className="text-tc-primary focus:ring-tc-primary" />
                        <span className="text-sm text-foreground">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Church Attendance</label>
                  <select 
                    value={formData.attendanceFreq}
                    onChange={(e) => updateForm("attendanceFreq", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Multiple times a week">Multiple times a week</option>
                    <option value="Occasionally">Occasionally</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Intentionality & Matching */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-foreground mb-2">Intentionality</h2>
              <p className="text-muted-foreground">Define your philosophy and set boundaries for connections.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Love Philosophy</label>
                <p className="text-xs text-muted-foreground mb-2">Share your biblical view on dating and marriage. This heavily influences your algorithmic matches.</p>
                <textarea 
                  value={formData.lovePhilosophy}
                  onChange={(e) => updateForm("lovePhilosophy", e.target.value)}
                  placeholder="e.g. I believe in a complementarian approach, valuing traditional family roles guided by faith..." 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all resize-none h-24"
                />
              </div>

              <div className="p-5 bg-secondary/50 rounded-2xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-tc-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <h3 className="font-semibold text-foreground">Connection Review Question</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  When someone wants to connect with you, they must answer this question. This filters out casual swipers and ensures intentionality.
                </p>
                
                <input 
                  type="text" 
                  value={formData.reviewQuestion}
                  onChange={(e) => updateForm("reviewQuestion", e.target.value)}
                  placeholder="e.g. What does a God-centered marriage look like to you?" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all mb-3"
                />

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isReviewMandatory}
                    onChange={(e) => updateForm("isReviewMandatory", e.target.checked)}
                    className="w-4 h-4 text-tc-primary rounded focus:ring-tc-primary border-border"
                  />
                  <span className="text-sm font-medium text-foreground">Make this question mandatory to answer</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-foreground mb-2">Add Your Photos</h2>
              <p className="text-muted-foreground">Upload at least one clear, modest photo showing your face.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Main Photo slot */}
              <div className="col-span-2 sm:col-span-1 aspect-[3/4] bg-tc-blush border-2 border-dashed border-tc-primary/30 rounded-2xl flex flex-col items-center justify-center text-tc-primary hover:bg-tc-primary/5 cursor-pointer transition-colors relative overflow-hidden group">
                <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="text-sm font-semibold">Main Photo</span>
              </div>
              
              {/* Extra Photo slots */}
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="aspect-[3/4] bg-secondary/30 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 cursor-pointer transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              *Photos are securely moderated to maintain our wholesome community standards.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-border flex justify-between items-center">
          {step > 1 ? (
            <button 
              onClick={handlePrev}
              className="px-6 py-3 font-semibold text-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
            >
              Back
            </button>
          ) : (
            <div /> // Placeholder to push Next button to right
          )}

          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="px-8 py-3 font-semibold text-white bg-tc-primary hover:bg-tc-primary-dark rounded-xl shadow-lg shadow-tc-primary/20 transition-all active:scale-95"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-tc-primary to-rose-500 hover:opacity-90 rounded-xl shadow-lg shadow-tc-primary/30 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? "Saving Profile..." : "Complete Profile"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
