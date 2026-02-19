"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { STOCK_SYMBOLS } from '@/lib/constants';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { loadFromCache, CACHE_KEYS } from '@/utils/cache';

interface MarketListProps {
  currentSymbol?: string;
  className?: string;
}

interface CachedPrediction {
  symbol: string;
  price?: number;
  change?: number;
  prediction?: number;
  signal?: string;
  status: string;
}

export function MarketList({ currentSymbol, className }: MarketListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cachedData, setCachedData] = useState<Record<string, CachedPrediction>>({});
  
  // Load cached predictions from dashboard
  useEffect(() => {
    const cached = loadFromCache<Record<string, CachedPrediction>>(CACHE_KEYS.DASHBOARD_LIST);
    if (cached) {
      setCachedData(cached);
    }
    
    // Refresh from cache every 30 seconds
    const interval = setInterval(() => {
      const fresh = loadFromCache<Record<string, CachedPrediction>>(CACHE_KEYS.DASHBOARD_LIST);
      if (fresh) setCachedData(fresh);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const filtered = STOCK_SYMBOLS.filter(s => 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("flex flex-col h-full bg-card border-r border-border/50", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border/50 sticky top-0 bg-card/95 backdrop-blur z-10">
        <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
            <BarChart2 className="text-blue-500" size={20} />
            Market Watch
        </h3>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full bg-muted/50 border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-background transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
        <AnimatePresence>
            {filtered.map((stock) => {
                const isActive = currentSymbol === stock.symbol;
                const cached = cachedData[stock.symbol];
                const hasData = cached && cached.status === 'success' && cached.change !== undefined;
                const isPositive = hasData ? (cached.change || 0) > 0 : null;
                
                return (
                    <Link 
                        key={stock.symbol}
                        href={`/predictions/${stock.symbol}`}
                    >
                        <motion.div 
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                                "group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border border-transparent",
                                isActive 
                                    ? "bg-blue-500/5 border-blue-500/20 shadow-sm" 
                                    : "hover:bg-muted/50 hover:border-border/50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-colors shadow-sm",
                                    isActive ? "bg-blue-500 text-white shadow-blue-500/20" : "bg-muted text-muted-foreground group-hover:bg-white group-hover:text-foreground"
                                )}>
                                    {stock.symbol[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("font-bold text-sm tracking-tight", isActive ? "text-blue-600 dark:text-blue-400" : "text-foreground")}>
                                        {stock.symbol.replace('.NS', '')}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[100px]">
                                        {stock.name}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                {hasData ? (
                                    <>
                                        <div className="text-xs font-black tabular-nums mb-0.5">
                                            ₹{(cached.price || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className={cn(
                                            "text-[11px] font-bold flex items-center justify-end gap-0.5",
                                            isPositive ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            {isPositive ? '+' : ''}{(cached.change || 0).toFixed(2)}%
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-12 h-4 bg-muted/50 rounded animate-pulse" />
                                )}
                            </div>
                        </motion.div>
                    </Link>
                );
            })}
        </AnimatePresence>
        
        {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
                No results found.
            </div>
        )}
      </div>
    </div>
  );
}
