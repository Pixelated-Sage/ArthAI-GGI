"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { WatchlistService, PredictionService } from '@/lib/api';
import Link from 'next/link';
import { Loader2, TrendingUp, TrendingDown, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  prediction7d?: {
      price: number;
      change_percent: number;
  };
}

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchWatchlist = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const symbols = await WatchlistService.getWatchlist();
            
            // Fetch data for each symbol
            const items = await Promise.all(symbols.map(async (symbol: string) => {
                try {
                    const data = await PredictionService.getPrediction(symbol);
                    const pred7d = data.predictions["7d"];
                    return {
                        symbol,
                        price: data.current_price,
                        change: 0, // Need real time change from API if available
                        changePercent: 0, 
                        prediction7d: pred7d
                    };
                } catch (e) {
                    return { symbol, price: 0, change: 0, changePercent: 0 };
                }
            }));
            
            setWatchlist(items);
        } catch (e) {
            console.error(e);
            setError("Failed to load watchlist");
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        fetchWatchlist();
    }
  }, [user]);

  const handleRemove = async (symbol: string) => {
      try {
          await WatchlistService.removeSymbol(symbol);
          setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      } catch (e) {
          console.error("Failed to remove", e);
      }
  };

  if (authLoading || (!user && loading)) {
      return (
          <DashboardShell title="Watchlist" subtitle="My Portfolio">
             <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="animate-spin text-blue-500" size={32} />
             </div>
          </DashboardShell>
      );
  }

  return (
    <DashboardShell title="Watchlist" subtitle="My Portfolio">
      <div className="max-w-7xl mx-auto pb-10">
        <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight mb-2">My Watchlist</h1>
            <p className="text-muted-foreground font-medium">Track your favorite assets and their AI predictions.</p>
        </div>

        {loading ? (
           <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
           </div>
        ) : watchlist.length === 0 ? (
           <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border/50">
               <TrendingUp size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
               <h3 className="text-xl font-bold mb-2">Your watchlist is empty</h3>
               <p className="text-muted-foreground mb-6">Start adding symbols from the market page to track them here.</p>
               <Link href="/predictions" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                   Explore Market <ArrowRight size={18} />
               </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {watchlist.map((item) => {
                   const isBullish = item.prediction7d && item.prediction7d.change_percent! > 0;
                   return (
                       <motion.div 
                        key={item.symbol}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-2xl p-6 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                       >
                           <Link href={`/predictions/${item.symbol}`} className="absolute inset-0 z-0" />
                           
                           <div className="flex justify-between items-start mb-4 relative z-10">
                               <div className="flex items-center gap-3">
                                   <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-bold text-lg">
                                       {item.symbol[0]}
                                   </div>
                                   <div>
                                       <h3 className="font-bold text-lg leading-none">{item.symbol}</h3>
                                       <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Stock</span>
                                   </div>
                               </div>
                               <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRemove(item.symbol);
                                }}
                                className="text-muted-foreground hover:text-rose-500 transition-colors p-2 hover:bg-rose-500/10 rounded-lg"
                               >
                                   <Trash2 size={18} />
                               </button>
                           </div>

                           <div className="flex justify-between items-end relative z-10">
                               <div>
                                   <div className="text-2xl font-black mb-1">${item.price.toFixed(2)}</div>
                                   <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Price</div>
                               </div>

                               {item.prediction7d && (
                                   <div className="text-right">
                                       <div className={cn(
                                           "text-lg font-black flex items-center justify-end gap-1", 
                                           isBullish ? "text-emerald-500" : "text-rose-500"
                                       )}>
                                           {isBullish ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                           {Math.abs(item.prediction7d.change_percent!).toFixed(2)}%
                                       </div>
                                       <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">7d Forecast</div>
                                   </div>
                               )}
                           </div>
                       </motion.div>
                   );
               })}
           </div>
        )}
      </div>
    </DashboardShell>
  );
}
