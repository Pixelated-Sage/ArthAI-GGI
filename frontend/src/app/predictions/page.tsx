"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Clock, 
  AlertCircle,
  Activity,
  ChevronRight,
  RefreshCcw,
  Zap,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/utils/cn";
import { PredictionService } from "@/lib/api";
import DashboardShell from "@/components/layout/DashboardShell";

import { STOCK_SYMBOLS } from "@/lib/constants";
import { StockSelector } from "@/components/predictions/StockSelector";
import { loadFromCache, saveToCache, CACHE_KEYS } from "@/utils/cache";

// Removed hardcoded SYMBOLS

interface PredictionSummary {
  symbol: string;
  name?: string;
  type?: string;
  price?: number;
  change?: number;
  prediction?: number;
  confidence?: number;
  signal?: string;
  status: 'loading' | 'success' | 'not_found' | 'error';
}

export default function PredictionsPage() {
  const [search, setSearch] = useState("");
  const [predictions, setPredictions] = useState<Record<string, PredictionSummary>>({});

  const fetchSymbolData = async (symbol: string) => {
    try {
      const data = await PredictionService.getPrediction(symbol);
      const pred7d = data.predictions["7d"];
      
      return {
        symbol,
        name: STOCK_SYMBOLS.find(s => s.symbol === symbol)?.name || symbol,
        type: "stock", // Default to stock for NIFTY 50
        price: data.current_price,
        change: ((pred7d.price - data.current_price) / data.current_price) * 100,
        prediction: pred7d.price,
        confidence: data.overall_confidence || pred7d.confidence || 0,
        signal: data.signal || "NEUTRAL",
        status: 'success'
      } as PredictionSummary;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return { symbol, status: 'not_found' } as PredictionSummary;
      }
      return { symbol, status: 'error' } as PredictionSummary;
    }
  };

  useEffect(() => {
    // 0. Load Cache first
    const cachedList = loadFromCache<Record<string, PredictionSummary>>(CACHE_KEYS.DASHBOARD_LIST);
    if (cachedList) {
        setPredictions(cachedList);
    }
    
    const fetchAll = async () => {
        const batchSize = 5; // Reduced concurrency to prevent blocking
        
        let currentPredictions = cachedList || {};

        for (let i = 0; i < STOCK_SYMBOLS.length; i += batchSize) {
            const batch = STOCK_SYMBOLS.slice(i, i + batchSize);
            
            // Set loading state only if not in cache
            setPredictions(prev => {
                const next = { ...prev };
                batch.forEach(s => {
                    if (!next[s.symbol]) {
                         next[s.symbol] = { symbol: s.symbol, status: 'loading' } as any;
                    }
                });
                return next;
            });

            // Fetch batch
            await Promise.all(batch.map(async (stock) => {
                 const result: any = await fetchSymbolData(stock.symbol);
                 
                 // Update local map and state
                 currentPredictions = { ...currentPredictions, [stock.symbol]: result };
                 
                 setPredictions(prev => ({ 
                     ...prev, 
                     [stock.symbol]: result 
                 }));
            }));
            
            // Save progressive updates to cache
            saveToCache(CACHE_KEYS.DASHBOARD_LIST, currentPredictions);
            
            // Small delay to be gentle on backend
            await new Promise(r => setTimeout(r, 200));
        }
    };
    
    // Defer network fetch slightly to allow UI to paint cache
    setTimeout(fetchAll, 100);
  }, []);

  const filtered = Object.values(predictions).filter(p => 
    p.symbol?.toLowerCase().includes(search.toLowerCase()) || 
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell title="Market Overview" subtitle="Dashboard">
      <div className="pb-12 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 text-blue-500 font-bold text-sm uppercase tracking-widest mb-2">
                <Zap size={16} />
                Live Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                NIFTY 50 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Forecasts</span>
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg font-medium leading-relaxed">
                AI-driven buy/sell signals for India's top companies.
              </p>
            </div>
            
            <div className="relative w-full md:w-96 group z-20">
              <StockSelector 
                onSelect={(s) => setSearch(s)} 
                className="shadow-xl shadow-blue-500/5"
              />
            </div>
          </motion.div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, idx) => (
                <PredictionCard key={item.symbol} item={item} index={idx} />
              ))}
            </AnimatePresence>
            
            {filtered.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center text-muted-foreground font-medium"
              >
                No predictions found matching "{search}".
              </motion.div>
            )}
            
            {/* Loading Indicator for specific Symbol Search */}
             {/* ... */}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 sticky top-28 shadow-xl shadow-blue-500/5">
               <h3 className="text-xl font-black flex items-center gap-3">
                  <Activity className="text-blue-500" />
                  System Status
               </h3>
               
               <div className="space-y-6">
                <div className="flex items-center justify-between group cursor-default">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                         <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Neural Engine</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Optimal Performance</p>
                      </div>
                   </div>
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                </div>
                
                <div className="flex items-center justify-between group cursor-default">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                         <RefreshCcw className="w-6 h-6 animate-spin-slow" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Global Training</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Synchronizing Symbols</p>
                      </div>
                   </div>
                   <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-1 rounded-lg">ACTIVE</span>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-[2rem] bg-muted/50 border border-border/50">
                 <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">
                  "Hybrid LSTM-XGBoost Consensus Engine active. Monitoring macro-economic signals and volatility indices."
                 </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-600/20 hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                 <BarChart2 size={120} />
              </div>
              <h3 className="text-3xl font-black mb-6 relative z-10 leading-tight">Unlock Pro<br/>Analytics</h3>
              <p className="text-blue-100/90 mb-8 text-sm relative z-10 leading-relaxed max-w-[200px] font-medium">
                Get deep insights into correlations and macroeconomic impact factors.
              </p>
              <button className="w-full py-4 bg-white text-blue-700 rounded-2xl font-black hover:bg-blue-50 active:scale-95 transition-all relative z-10 shadow-lg">
                Unlock Pro Access
              </button>
            </div>
          </aside>
        </section>
    </div>
    </DashboardShell>
  );
}

function PredictionCard({ item, index }: { item: PredictionSummary, index: number }) {
  if (item.status === 'loading') {
    return (
      <div className="bg-card border border-border p-8 rounded-[2.5rem] animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-muted" />
          <div className="space-y-3">
            <div className="h-6 w-24 bg-muted rounded-lg" />
            <div className="h-4 w-32 bg-muted rounded-lg" />
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[1,2,3,4].map(i => <div key={i} className="h-12 bg-muted rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (item.status === 'not_found' || item.status === 'error' || !item.price) {
    return (
      <div className="bg-card border border-border/60 p-8 rounded-[2.5rem] opacity-60 grayscale-[0.8] hover:grayscale-0 hover:opacity-100 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-muted/30 flex items-center justify-center font-black text-2xl text-muted-foreground border border-border">
             {item.symbol[0]}
          </div>
          <div>
            <h3 className="text-2xl font-black flex items-center gap-3">
               {item.symbol}
               <span className="text-[10px] bg-muted px-3 py-1 rounded-full font-bold tracking-widest text-muted-foreground">TRAINING</span>
            </h3>
            <p className="text-sm font-medium text-muted-foreground">Model optimization in progress...</p>
          </div>
        </div>
        <div className="text-sm font-medium text-muted-foreground max-w-xs md:text-right">
          AI engine is calculating initial weights.
        </div>
      </div>
    );
  }

  const isPositive = (item.change || 0) > 0;
  const isBullish = (item.prediction || 0) > (item.price || 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border hover:border-blue-500/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors duration-500" />
      
      <div className="flex items-center gap-6 relative z-10">
        <div className={cn(
          "w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl transition-transform group-hover:scale-110 duration-500 shadow-inner relative",
          item.type === "crypto" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
        )}>
          {/* Signal Indicator Dot */}
          <div className={cn(
            "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background shadow-sm",
            item.signal?.includes("BUY") ? "bg-emerald-500" : item.signal?.includes("SELL") ? "bg-rose-500" : "bg-gray-400"
          )} />
          {item.symbol[0]}
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
            {item.symbol}
            {/* Signal Text Badge */}
             {(item.signal && item.signal !== "NEUTRAL") && (
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-md font-black tracking-wider uppercase border",
                  item.signal?.includes("BUY") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                )}>
                  {item.signal}
                </span>
             )}
          </h3>
          <p className="text-sm font-bold text-muted-foreground">{item.name}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">Current Price</p>
          <p className="text-xl font-black tracking-tight">₹{(item.price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">AI Forecast (7d)</p>
          <p className={cn(
            "text-xl font-black tracking-tight",
            isBullish ? "text-emerald-500" : "text-rose-500"
          )}>
            ₹{(item.prediction || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter mt-1",
            isBullish ? "text-emerald-500" : "text-rose-500"
          )}>
            {isBullish ? <TrendingUp size={10} /> : <TrendingDown size={10} /> }
            {isPositive ? "+" : ""}{(item.change || 0).toFixed(2)}%
          </div>
        </div>

        <div className="hidden lg:block">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">Consensus Confidence</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-3.5 bg-muted rounded-full overflow-hidden p-[3px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(item.confidence || 0) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] relative"
              >
                 <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
            <span className="text-sm font-black w-10">{((item.confidence || 0) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <Link 
        href={`/predictions/${item.symbol.toUpperCase()}`}
        className="w-16 h-16 bg-secondary hover:bg-blue-600 hover:text-white text-foreground rounded-3xl transition-all duration-300 shrink-0 flex items-center justify-center group/btn shadow-lg shadow-black/5 hover:shadow-blue-600/20 relative z-10"
      >
        <ChevronRight size={28} className="group-hover/btn:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}
