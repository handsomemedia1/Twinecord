"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Discover", href: "/discover", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { label: "Matches", href: "/matches", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
    { label: "Community", href: "/feed", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Profile", href: "/profile/me", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 flex-col bg-card border-r border-border h-screen sticky top-0 shadow-[4px_0_24px_rgba(225,29,72,0.02)] z-10">
        <div className="p-8">
          <Link href="/discover" className="flex items-center gap-3 mb-12">
            <Image src="/logo.png" alt="TwineCord Logo" width={40} height={40} className="rounded-xl shadow-md" />
            <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-foreground">
              TwineCord
            </span>
          </Link>
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
                    isActive 
                      ? "bg-tc-blush text-tc-primary font-semibold shadow-inner" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-y-auto pb-24 md:pb-0 hide-scrollbar scroll-smooth bg-tc-blush/30">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4 pb-safe flex justify-between items-center z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl bg-opacity-90">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex flex-col items-center gap-1.5 transition-colors ${
                isActive ? "text-tc-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-tc-blush' : ''}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                </svg>
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
