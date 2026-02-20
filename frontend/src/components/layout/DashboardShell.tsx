"use client";

import React from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Search, Bell, Monitor, User, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import ChatbotWidget from '@/components/ChatbotWidget';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function DashboardShell({
  children,
  title = "Dashboard",
  subtitle = "Overview",
  showSearch = true
}: DashboardShellProps) {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-blue-500/20">
      {/* Sidebar - Desktop */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative lg:ml-64 bg-secondary/10">
        
        {/* Top Header */}
        <header className="h-20 border-b border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 z-40 sticky top-0 transition-all">
           {/* Left: Breadcrumbs or Title */}
           <div className="hidden md:flex items-center gap-4 text-muted-foreground text-sm font-medium">
              <span className="hover:text-foreground cursor-pointer transition-colors text-border">{subtitle}</span>
              <span className="text-border">/</span>
              <span className="text-foreground font-bold">{title}</span>
           </div>
           
           {/* Mobile Menu Toggle (Placeholder - can be implemented with context) */}
           <div className="md:hidden">
              <Menu className="text-muted-foreground" />
           </div>

           {/* Right: Actions */}
           <div className="flex items-center ml-auto gap-4 md:gap-6">
              {/* Search */}
              {showSearch && (
                <div className="relative hidden md:block group">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={16} />
                   <input 
                      type="text" 
                      placeholder="Search..." 
                      className="w-64 bg-secondary/50 border border-transparent focus:border-blue-500/30 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-muted-foreground/60"
                   />
                </div>
              )}

              {/* Language / Currency */}
              <div className="hidden md:flex items-center gap-4 text-xs font-bold text-muted-foreground">
                 <button className="hover:text-foreground flex items-center gap-1">ENG <ChevronDown size={12}/></button>
                 <button className="hover:text-foreground flex items-center gap-1">INR <ChevronDown size={12}/></button>
              </div>
              
              <div className="h-8 w-px bg-border/50 hidden md:block" />

              {/* Theme Toggle Button */}
              <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative">
                 <Monitor size={20} />
              </button>
              
              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse" />
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold leading-none">{user?.displayName || "Trader"}</p>
                    <p className="text-xs text-muted-foreground font-medium">{user?.email || "Pro Plan"}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-blue-500" />
                        )}
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
          <div className="max-w-[1600px] mx-auto h-full flex flex-col">
             {children}
          </div>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
