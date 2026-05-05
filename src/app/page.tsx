"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FEATURES, TESTIMONIALS } from "@/constants";

/* ===== Intersection Observer Hook ===== */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-fade-in-up");
          el.style.opacity = "1";
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ===== MODERN WEB APP LANDING PAGE ===== */
export default function AppLandingPage() {
  const [activeTab, setActiveTab] = useState("discover");

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* ===== DESKTOP SIDEBAR (App Navigation) ===== */}
      <aside className="hidden md:flex w-72 flex-col bg-card border-r border-border h-screen sticky top-0 z-40 shadow-2xl shadow-tc-primary/5">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-tc-primary/20">
              <Image src="/logo.png" alt="TwineCord Logo" fill className="object-cover" />
            </div>
            <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-foreground">
              TwineCord
            </span>
          </div>

          <nav className="flex flex-col gap-2">
            <DesktopNavIcon 
              icon="home" 
              label="Discover" 
              active={activeTab === "discover"} 
              onClick={() => setActiveTab("discover")} 
            />
            <DesktopNavIcon 
              icon="heart" 
              label="Success Stories" 
              active={activeTab === "stories"} 
              onClick={() => setActiveTab("stories")} 
            />
            <DesktopNavIcon 
              icon="users" 
              label="Community" 
              active={activeTab === "community"} 
              onClick={() => setActiveTab("community")} 
            />
            <DesktopNavIcon 
              icon="shield" 
              label="Safety" 
              active={activeTab === "safety"} 
              onClick={() => setActiveTab("safety")} 
            />
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-tc-blush rounded-2xl p-6 border border-tc-primary/10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-tc-primary/5 to-tc-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="font-bold text-foreground mb-2 font-[family-name:var(--font-heading)] text-lg">Ready to Connect?</h3>
            <p className="text-xs text-muted-foreground mb-4">Join thousands of Christian singles.</p>
            <div className="flex flex-col gap-3 relative z-10">
              <Link href="/signup" className="w-full py-3 bg-tc-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-tc-primary/30 hover:shadow-tc-primary/50 hover:bg-tc-primary-dark transition-all">
                Create Account
              </Link>
              <Link href="/login" className="w-full py-3 bg-white border border-border text-foreground text-sm font-semibold rounded-xl hover:bg-tc-blush transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <header className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="TwineCord Logo" width={32} height={32} className="rounded-lg object-cover shadow-sm" />
          <span className="text-xl font-bold font-[family-name:var(--font-heading)] text-foreground">
            TwineCord
          </span>
        </div>
        <Link href="/login" className="text-sm font-semibold text-tc-primary bg-tc-primary/10 px-4 py-2 rounded-full">
          Sign In
        </Link>
      </header>

      {/* ===== MAIN CONTENT AREA ===== */}
      <main className="flex-1 h-screen overflow-y-auto pb-24 md:pb-8 hide-scrollbar scroll-smooth bg-tc-blush/30">
        <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12">
          
          {activeTab === "discover" && (
            <div className="animate-fade-in">
              {/* HERO SECTION (App-like Dashboard View) */}
              <section className="relative mb-12 md:mb-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-heart-glow -z-10 blur-3xl opacity-50" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Text Content */}
                  <div className="order-2 lg:order-1 text-center lg:text-left">
                    <Badge className="bg-tc-primary/10 hover:bg-tc-primary/20 text-tc-primary border-tc-primary/20 mb-6 px-4 py-1.5 text-sm">
                      ✝️ Faith-Centered Matchmaking
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-6 text-foreground">
                      Bridging <span className="text-gradient-romantic">Love</span>,<br/>
                      Faith, and <span className="text-tc-gold">Purpose</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                      A premium Christian digital platform where intentional hearts meet. Find your God-ordained partner through faith-based matching and meaningful conversations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start md:hidden">
                      <Link href="/signup" className="btn-app-primary sm:w-auto px-8">
                        Create Profile
                      </Link>
                    </div>
                  </div>

                  {/* Hero Image / UI Mockup */}
                  <div className="order-1 lg:order-2 relative w-full max-w-md mx-auto aspect-[3/4] lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-tc-primary/20 border-8 border-white dark:border-tc-dark-light transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                    <Image 
                      src="/hero-app.png" 
                      alt="TwineCord App Interface" 
                      fill 
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" />
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                      <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white text-xs font-medium">Active Now</span>
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-3xl font-bold text-white mb-2 font-[family-name:var(--font-heading)] drop-shadow-md">Sarah, 26</h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-white/20 text-white border-none backdrop-blur-md">Non-Denominational</Badge>
                        <Badge className="bg-tc-primary/80 text-white border-none backdrop-blur-md">Marriage Minded</Badge>
                      </div>
                      <div className="flex gap-4">
                        <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-3 rounded-2xl transition-colors flex justify-center items-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <button className="flex-[2] bg-tc-primary hover:bg-tc-primary-dark text-white py-3 rounded-2xl shadow-lg shadow-tc-primary/50 transition-all flex justify-center items-center gap-2">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          <span className="font-semibold">Connect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* APP STATS / FEATURES GRID */}
              <section className="mb-12 md:mb-20">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">Designed for Connection</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {FEATURES.map((feature, i) => (
                    <FeatureCard key={feature.title} feature={feature} index={i} />
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "stories" && (
            <div className="animate-fade-in min-h-[60vh] flex flex-col justify-center">
              {/* SUCCESS STORIES (Horizontal Scroll) */}
              <section className="bg-card rounded-3xl p-6 md:p-10 shadow-sm border border-border">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-heading)] mb-2">Love Stories</h2>
                    <p className="text-muted-foreground text-sm">Real couples who found their cord on our platform.</p>
                  </div>
                </div>
                
                <ScrollArea className="w-full whitespace-nowrap pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="flex w-max space-x-6">
                    {TESTIMONIALS.map((testimonial, i) => (
                      <StoryCard key={testimonial.name} testimonial={testimonial} index={i} />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="hidden md:flex" />
                </ScrollArea>
              </section>
            </div>
          )}

          {activeTab === "community" && (
            <div className="animate-fade-in min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-tc-primary/10 rounded-full flex items-center justify-center mb-6 text-tc-primary">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-4">Premium Community Feed</h2>
              <p className="text-muted-foreground max-w-lg mb-8">
                Join our exclusive community feed. Premium members can post deeper reflections and photos. Everyone can engage, encourage, and connect in a safe, Facebook-style hidden comment environment.
              </p>
              <Link href="/signup" className="btn-app-primary max-w-xs mx-auto">
                Join the Community
              </Link>
            </div>
          )}

          {activeTab === "safety" && (
            <div className="animate-fade-in min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-tc-primary/10 rounded-full flex items-center justify-center mb-6 text-tc-primary">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-4">Uncompromising Security</h2>
              <p className="text-muted-foreground max-w-lg mb-8">
                Your safety is our priority. We employ strict data logging, user verification, and mandatory Connection Request review questions. Only connect with people who align with your values.
              </p>
              <Link href="/signup" className="btn-app-primary max-w-xs mx-auto">
                Create Secure Profile
              </Link>
            </div>
          )}

          {/* MISSION STATEMENT (Always visible at bottom) */}
          <section className="py-12 md:py-20 text-center max-w-2xl mx-auto border-t border-border mt-12">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-tc-primary to-tc-primary-light rounded-full flex items-center justify-center mb-6 shadow-xl shadow-tc-primary/20 text-white">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl italic text-foreground mb-4">
              "A cord of three strands is not quickly broken."
            </p>
            <p className="text-sm text-tc-gold font-bold uppercase tracking-widest">Ecclesiastes 4:12</p>
          </section>

        </div>
      </main>

      {/* ===== MOBILE BOTTOM NAVIGATION ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border px-6 py-4 pb-safe flex justify-between items-center z-50">
        <MobileNavIcon 
          icon="home" 
          label="Discover" 
          active={activeTab === "discover"} 
          onClick={() => setActiveTab("discover")} 
        />
        <MobileNavIcon 
          icon="heart" 
          label="Stories" 
          active={activeTab === "stories"} 
          onClick={() => setActiveTab("stories")} 
        />
        <MobileNavIcon 
          icon="users" 
          label="Community" 
          active={activeTab === "community"} 
          onClick={() => setActiveTab("community")} 
        />
        <MobileNavIcon 
          icon="user" 
          label="Profile" 
          active={activeTab === "profile"} 
          onClick={() => setActiveTab("profile")} 
        />
      </nav>
    </div>
  );
}

/* ===== APP COMPONENTS ===== */

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="bg-card hover:bg-tc-blush/50 transition-colors p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-4 opacity-0" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="w-12 h-12 rounded-2xl bg-tc-primary/10 flex items-center justify-center text-tc-primary">
        <FeatureIcon icon={feature.icon} />
      </div>
      <div>
        <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </div>
    </div>
  );
}

function StoryCard({ testimonial, index }: { testimonial: any; index: number }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="w-[300px] md:w-[350px] bg-background p-6 rounded-3xl border border-border shadow-sm shrink-0 opacity-0 relative overflow-hidden group" style={{ animationDelay: `${index * 0.15}s` }}>
      {/* Background image for the first card to make it pop */}
      {index === 0 && (
        <>
          <Image src="/couple-photo.png" alt="Couple" fill className="object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50" />
        </>
      )}
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="text-4xl text-tc-gold mb-2 font-[family-name:var(--font-heading)]">"</div>
        <p className="text-base italic text-foreground/90 mb-6 whitespace-normal flex-1">
          {testimonial.quote}
        </p>
        <div className="flex items-center gap-3 mt-auto">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tc-primary to-tc-primary-light flex items-center justify-center text-white text-sm font-bold shadow-md">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">{testimonial.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopNavIcon({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  const icons: Record<string, React.ReactNode> = {
    home: <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    heart: <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    users: <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    shield: <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  };

  return (
    <button onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-tc-primary/10 text-tc-primary font-semibold' : 'text-muted-foreground hover:bg-tc-blush hover:text-foreground font-medium'}`}>
      {icons[icon]}
      <span>{label}</span>
    </button>
  );
}

function MobileNavIcon({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  const icons: Record<string, React.ReactNode> = {
    home: <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    heart: <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    users: <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    user: <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  };

  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-tc-primary' : 'text-muted-foreground hover:text-foreground'}`}>
      {icons[icon]}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function FeatureIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    Cross: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M6 8h12" /></svg>,
    Heart: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
    Shield: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    Fingerprint: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.326 10.3m3.605-8.55A4.5 4.5 0 0112 6a4.5 4.5 0 014.5 4.5c0 1.875-.223 3.7-.646 5.453M12 10.5a.75.75 0 01.75.75c0 2.936-.342 5.79-.991 8.535m-1.518-8.535a.75.75 0 00-.75.75c0 2.349-.21 4.645-.612 6.874" /></svg>,
    Users: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    Sparkles: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  };
  return icons[icon] || null;
}
