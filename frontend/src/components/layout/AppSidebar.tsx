"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  LayoutDashboard, 
  Eye, 
  GraduationCap, 
  Info,
  LogOut,
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { name: 'Dashboard', href: '/predictions', icon: LayoutDashboard, description: 'Market overview & forecasts' },
  { name: 'Watchlist', href: '/watchlist', icon: Eye, description: 'Track your favorites' },
  { name: 'Learn', href: '/learn', icon: GraduationCap, description: 'AI trading guides' },
  { name: 'About', href: '/about', icon: Info, description: 'How FinPredict works' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border hidden lg:flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight">
              FinPredict<span className="text-blue-500">AI</span>
            </span>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest -mt-0.5">
              Neural Engine v2
            </p>
          </div>
        </Link>
      </div>

      {/* Main Menu */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = item.href === '/predictions' 
             ? pathname.startsWith('/predictions')
             : pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group relative",
                isActive 
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={18} className={cn(!isActive && "group-hover:text-blue-500 transition-colors")} />
              <div className="flex-1">
                <span className="block">{item.name}</span>
                {isActive && (
                  <span className="text-[10px] text-blue-100 font-medium opacity-80">
                    {item.description}
                  </span>
                )}
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
              {!isActive && (
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity -mr-1" />
              )}
            </Link>
          );
        })}

        {/* Live Status Indicator */}
        <div className="mt-8 mx-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Activity size={16} className="text-emerald-500" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
            ML Server active. Models loaded and serving predictions in real-time.
          </p>
        </div>
      </div>

      {/* Pro Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group hover:shadow-blue-500/30 transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
            <Sparkles size={48} />
          </div>
          <h4 className="font-black mb-1 relative z-10 text-sm">Go Pro</h4>
          <p className="text-[11px] text-blue-100 mb-3 relative z-10 opacity-90 leading-relaxed">
            Unlock advanced AI signals & multi-stock portfolio analysis.
          </p>
          <button className="w-full bg-white text-blue-600 text-xs font-bold py-2 rounded-lg hover:bg-blue-50 transition-colors relative z-10 shadow-sm">
            Upgrade Now
          </button>
        </div>
      </div>
      
      {/* User Mini Profile */}
      <div className="p-4 border-t border-border/50">
          <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted transition-colors text-left group">
             <div className="w-10 h-10 rounded-full bg-muted-foreground/10 flex items-center justify-center text-muted-foreground group-hover:bg-rose-500/10 group-hover:text-rose-500 transition-colors">
                <LogOut size={18} />
             </div>
             <div>
                <p className="text-sm font-bold">Sign Out</p>
                <p className="text-xs text-muted-foreground">Session active</p>
             </div>
          </button>
      </div>
    </aside>
  );
}
