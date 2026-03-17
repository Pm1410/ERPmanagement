"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "#about" },
    { name: "Academics", href: "#academics" },
    { name: "Admissions", href: "/apply" },
    { name: "News & Events", href: "#events" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-sm border-border" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <div className="bg-primary p-1.5 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className={`text-xl font-bold tracking-tight transition-colors ${isScrolled ? "text-foreground" : "text-white"}`}>
            Edura ERP
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? "text-neutral-600" : "text-white/90 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Link 
            href="/login" 
            className={`text-sm font-semibold transition-colors ${
              isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-white/80"
            }`}
          >
            Log in
          </Link>
          <Link 
            href="/apply" 
            className={`text-sm font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm ${
              isScrolled 
                ? "bg-primary text-white hover:bg-primary/90" 
                : "bg-white text-primary hover:bg-neutral-100"
            }`}
          >
            Apply Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={`w-6 h-6 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`} />
          ) : (
            <Menu className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-white"}`} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-white z-40 lg:hidden transition-transform duration-300 flex flex-col pt-24 px-6 pb-6 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-6 flex-grow text-lg font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-foreground border-b border-border/50 pb-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex flex-col gap-4 mt-auto">
          <Link 
            href="/login" 
            className="w-full h-12 flex items-center justify-center rounded-md border-2 border-primary text-primary font-semibold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Log in
          </Link>
          <Link 
            href="/apply" 
            className="w-full h-12 flex items-center justify-center rounded-md bg-primary text-white font-semibold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Apply Now
          </Link>
        </div>
      </div>
    </header>
  );
}
