"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-foreground/80 hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="font-medium text-sm">Back home</span>
        </Link>
        
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8 text-center sm:text-left">
            <Link href="/" className="inline-block mb-6">
              <Image src="/logo.png" alt="TwineCord" width={48} height={48} className="rounded-xl shadow-md mx-auto sm:mx-0" />
            </Link>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-2 text-foreground">
              {isLogin ? "Welcome back" : "Begin your journey"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? "Enter your details to sign in to your account." : "Create an account to find your God-ordained partner."}
            </p>
          </div>
          
          {children}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <p>Don't have an account? <Link href="/signup" className="text-tc-primary font-semibold hover:underline">Sign up</Link></p>
            ) : (
              <p>Already have an account? <Link href="/login" className="text-tc-primary font-semibold hover:underline">Sign in</Link></p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-tc-blush overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/couple-photo.png" 
            alt="Christian Couple" 
            fill 
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tc-dark/90 via-tc-dark/40 to-transparent mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 p-16 text-white max-w-lg text-center">
          <div className="text-5xl text-tc-gold mb-4 font-[family-name:var(--font-heading)]">"</div>
          <p className="text-2xl italic font-light mb-8 leading-relaxed text-white/90">
            A cord of three strands is not quickly broken. Let faith be the foundation of your love story.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-tc-primary flex items-center justify-center text-white font-bold shadow-lg">T</div>
            <div className="text-left">
              <p className="font-semibold text-sm">TwineCord Platform</p>
              <p className="text-xs text-white/60">Built on Biblical Principles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
