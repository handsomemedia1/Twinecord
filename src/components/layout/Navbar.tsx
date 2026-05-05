"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 dark:bg-tc-navy/80 backdrop-blur-xl shadow-lg shadow-tc-purple/5 border-b border-tc-purple/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-tc-purple to-tc-purple-light rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                T
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-bold">
              <span className="text-gradient-purple">Twine</span>
              <span className="text-tc-gold">Cord</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-foreground/70 hover:text-tc-purple transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-foreground/70 hover:text-tc-purple transition-colors"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-foreground/70 hover:text-tc-purple transition-colors"
            >
              Stories
            </a>
            <a
              href="#scripture"
              className="text-sm font-medium text-foreground/70 hover:text-tc-purple transition-colors"
            >
              Our Heart
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground/70 hover:text-tc-purple transition-colors px-3 py-2 rounded-lg hover:bg-tc-purple/5"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-gradient-purple hover:opacity-90 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-tc-purple/25 transition-all duration-300 hover:shadow-tc-purple/40 hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                  mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-xl transition-all duration-500 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-8 pt-20">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-semibold text-foreground/80 hover:text-tc-purple transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-semibold text-foreground/80 hover:text-tc-purple transition-colors"
          >
            How It Works
          </a>
          <a
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-semibold text-foreground/80 hover:text-tc-purple transition-colors"
          >
            Stories
          </a>
          <div className="flex flex-col gap-4 mt-8 w-64">
            <Link
              href="/login"
              className="w-full text-center py-3 px-6 rounded-lg border border-tc-purple/30 text-foreground font-medium hover:bg-tc-purple/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="w-full text-center py-3 px-6 rounded-lg bg-gradient-purple text-white font-medium shadow-lg shadow-tc-purple/25 hover:opacity-90 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
