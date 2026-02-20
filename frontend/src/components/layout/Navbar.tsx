"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, TrendingUp, BarChart3, PieChart, Info, User, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";


const navItems = [
  { name: "Predictions", href: "/predictions", icon: BarChart3 },
  { name: "Watchlist", href: "/watchlist", icon: TrendingUp },
  { name: "Portfolio", href: "/portfolio", icon: PieChart },
  { name: "Learn", href: "/learn", icon: Info },
  { name: "About", href: "/about", icon: Info },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
        scrolled ? "glass py-2" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <TrendingUp size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Arth<span className="text-blue-500">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full" />
            </Link>
          ))}
          
          {loading ? (
             <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
             <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-muted/50 hover:bg-muted pl-1 pr-3 py-1 rounded-full transition-colors border border-border"
                >
                   {user.photoURL ? (
                       <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                   ) : (
                       <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                           {user.email?.[0].toUpperCase()}
                       </div>
                   )}
                   <span className="text-sm font-medium max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                </button>
                
                <AnimatePresence>
                    {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden p-1"
                        >
                            <div className="px-3 py-2 text-xs text-muted-foreground font-bold uppercase tracking-widest border-b border-border/50 mb-1">
                                Account
                            </div>
                            <button 
                                onClick={() => signOut()}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>
          ) : (
            <Link href="/login" className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20">
                <User size={16} />
                Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground p-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass border-t border-border/50 p-4 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <item.icon size={20} className="text-blue-500" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              <div className="h-px bg-border/50 my-2" />
              
              {user ? (
                 <button 
                    onClick={() => signOut()}
                    className="bg-red-500/10 text-red-500 w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                 >
                    <LogOut size={18} />
                    Sign Out
                 </button>
              ) : (
                 <Link href="/login" className="bg-primary text-primary-foreground w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                    <User size={18} />
                    Sign In
                 </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
