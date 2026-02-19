"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  Maximize2,
  Layers,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Target
} from "lucide-react";
import { PredictionService, HistoricalService } from "@/lib/api";
import { StockChart } from "@/components/predictions/StockChart";
import { TradingSignalCard } from "@/components/prediction/TradingSignalCard";
import { MarketList } from "@/components/predictions/MarketList"; 
import { STOCK_SYMBOLS } from "@/lib/constants";
import { cn } from "@/utils/cn";
import DashboardShell from "@/components/layout/DashboardShell";

import { Prediction } from "@/types/start";

// Types
interface PredictionData extends Omit<Prediction, 'signal'> {
  signal: string;
  max_price?: number;
  min_price?: number;
  volatility?: number;
}

const horizons = [
  { label: "1D", value: "1d" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" }
];

export default function PredictionDetail() {
  const params = useParams();
  const router = useRouter();
  const symbol = decodeURIComponent(params.symbol as string);
  const stockInfo = STOCK_SYMBOLS.find(s => s.symbol === symbol);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PredictionData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHorizon, setSelectedHorizon] = useState("7d");
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const [predData, histData] = await Promise.all([
        PredictionService.getPrediction(symbol),
        HistoricalService.getOHLCV(symbol, 100)
      ]);
      setData({
          ...predData,
          symbol,
          timestamp: new Date().toISOString()
      });
      setHistory(histData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
      setError("Failed to load analysis data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [symbol]);

  // Sort history ascending for calculations
  const sortedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    return [...history].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [history]);

  const activePrediction = data?.predictions[selectedHorizon];
  const isBullish = activePrediction?.change_percent && activePrediction.change_percent > 0;

  // Calculate actual stats from historical data
  const stats = useMemo(() => {
    if (sortedHistory.length === 0) return null;
    const last = sortedHistory[sortedHistory.length - 1];
    const prices = sortedHistory.map((d: any) => d.close);
    
    // Annualized volatility
    const returns = [];
    for (let i = 1; i < Math.min(prices.length, 21); i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const dailyVol = Math.sqrt(variance);
    const annualizedVol = dailyVol * Math.sqrt(252);
    
    // 52-week high/low (use available data)
    const allHighs = sortedHistory.map((d: any) => d.high);
    const allLows = sortedHistory.map((d: any) => d.low);
    
    return {
      dayHigh: last.high,
      dayLow: last.low,
      dayOpen: last.open,
      volume: last.volume,
      periodHigh: Math.max(...allHighs),
      periodLow: Math.min(...allLows),
      volatility: annualizedVol,
      dayChange: last.close - last.open,
      dayChangePct: ((last.close - last.open) / last.open) * 100,
    };
  }, [sortedHistory]);

  if (loading && !data) {
     return (
        <DashboardShell title={symbol} subtitle="Analysis">
            <div className="flex h-full items-center justify-center p-20">
               <div className="flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Activity className="animate-spin" />
                  </div>
                  <p className="font-bold text-muted-foreground">Initializing Neural Engine...</p>
               </div>
            </div>
        </DashboardShell>
     );
  }

  if (error || !data) {
     return (
        <DashboardShell title={symbol} subtitle="Error">
            <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-md mx-auto">
                <div className="w-24 h-24 rounded-[2rem] bg-rose-500/5 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/10">
                    <AlertTriangle size={48} />
                </div>
                <h2 className="text-3xl font-black mb-3 text-rose-500">Analysis Failed</h2>
                <p className="text-muted-foreground mb-8 text-lg font-medium leading-relaxed">
                    We couldn&apos;t generate a prediction for <span className="text-foreground font-bold">{symbol}</span>. 
                    This might be due to insufficient historical data or the model not being trained yet.
                </p>
                <button 
                    onClick={() => router.push('/predictions')}
                    className="px-8 py-4 bg-foreground text-background rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl"
                >
                    <ArrowLeft size={20} /> Return to Dashboard
                </button>
            </div>
        </DashboardShell>
     );
  }

  // Determine overall signal for the selected horizon
  const predSignal = activePrediction?.change_percent 
    ? (activePrediction.change_percent > 1.5 ? 'BUY' 
      : activePrediction.change_percent > 0.5 ? 'LEAN BUY'
      : activePrediction.change_percent < -1.5 ? 'SELL'
      : activePrediction.change_percent < -0.5 ? 'LEAN SELL'
      : 'NEUTRAL')
    : data.signal || 'NEUTRAL';

  return (
    <DashboardShell title={symbol} subtitle="Market Analysis">
        <div className="flex flex-col md:flex-row h-full gap-6 pb-6">
           {/* Left Column: Market List (Sidebar Style) */}
           <div className="hidden xl:flex w-80 flex-shrink-0 flex-col gap-4 h-[calc(100vh-140px)] sticky top-0">
               <MarketList currentSymbol={symbol} className="rounded-[2.5rem] border border-border bg-card shadow-sm h-full overflow-hidden" />
           </div>

           {/* Right Column: Main Content */}
           <div className="flex-1 min-w-0 space-y-6">
              
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Current Price */}
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                     className="bg-card p-6 rounded-[2rem] border border-border flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors"
                  >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-3 relative z-10">
                          <div>
                              <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-1">Current Price</p>
                              <h3 className="text-3xl font-black tracking-tight flex items-baseline gap-1">
                                  ₹{data.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </h3>
                          </div>
                          <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                              stats && stats.dayChange >= 0 
                                ? "bg-emerald-500/10 text-emerald-500" 
                                : "bg-rose-500/10 text-rose-500"
                          )}>
                              <DollarSign size={20} />
                          </div>
                      </div>
                      {stats && (
                        <div className={cn(
                            "inline-flex items-center gap-1 text-sm font-bold",
                            stats.dayChange >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {stats.dayChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {stats.dayChange >= 0 ? '+' : ''}{stats.dayChange.toFixed(2)} ({stats.dayChangePct >= 0 ? '+' : ''}{stats.dayChangePct.toFixed(2)}%)
                            <span className="text-muted-foreground font-medium ml-1 text-xs">today</span>
                        </div>
                      )}
                  </motion.div>

                  {/* AI Confidence */}
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                     className="bg-card p-6 rounded-[2rem] border border-border flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-purple-500/30 transition-colors"
                  > 
                      <div className="flex justify-between items-start mb-3">
                          <div>
                              <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-1">AI Confidence</p>
                              <h3 className="text-3xl font-black tracking-tight">
                                {((activePrediction?.confidence || data.overall_confidence || 0) * 100).toFixed(0)}%
                              </h3>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                              <ShieldCheck size={20} />
                          </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${(activePrediction?.confidence || data.overall_confidence || 0) * 100}%` }}
                          />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium mt-2">
                        Model agreement for {selectedHorizon} horizon
                      </p>
                  </motion.div>

                  {/* Predicted Target */}
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                     className="bg-card p-6 rounded-[2rem] border border-border flex flex-col justify-between shadow-sm group hover:border-emerald-500/30 transition-colors"
                  >
                      <div className="flex justify-between items-start mb-3">
                          <div>
                              <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-1">
                                {selectedHorizon} Target
                              </p>
                              <h3 className={cn(
                                  "text-3xl font-black tracking-tight",
                                  isBullish ? "text-emerald-500" : "text-rose-500"
                              )}>
                                  ₹{activePrediction?.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </h3>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                              <Target size={20} />
                          </div>
                      </div>
                      <div className={cn(
                          "inline-flex items-center gap-1 text-sm font-bold",
                          isBullish ? "text-emerald-500" : "text-rose-500"
                      )}>
                          {isBullish ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          {activePrediction?.change_percent !== undefined && (
                            <>
                              {activePrediction.change_percent >= 0 ? '+' : ''}
                              {activePrediction.change_percent.toFixed(2)}%
                            </>
                          )}
                          <span className="text-muted-foreground font-medium ml-1 text-xs">expected</span>
                      </div>
                  </motion.div>

                  {/* Signal Card */}
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                     className={cn(
                       "p-6 rounded-[2rem] shadow-lg relative overflow-hidden group",
                       predSignal.includes('BUY') 
                         ? "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-emerald-500/20"
                         : predSignal.includes('SELL')
                           ? "bg-gradient-to-br from-rose-600 to-rose-800 text-white shadow-rose-500/20"
                           : "bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-blue-500/20"
                     )}
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                          <Zap size={64} />
                      </div>
                      <div className="relative z-10 flex flex-col h-full justify-between">
                         <div>
                            <p className="text-white/70 font-bold text-xs uppercase tracking-wider mb-1">Signal ({selectedHorizon})</p>
                            <h3 className="text-2xl font-black tracking-tight">{data.signal || 'NEUTRAL'}</h3>
                         </div>
                         <div className="flex items-center gap-2 mt-3">
                           <Clock size={12} className="opacity-60" />
                           <span className="text-[10px] opacity-70 font-medium">
                             Updated {lastRefresh.toLocaleTimeString()}
                           </span>
                         </div>
                      </div>
                  </motion.div>
              </div>

              {/* Main Chart Section */}
              <div className="bg-card border border-border rounded-[2.5rem] p-4 lg:p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden min-h-[500px]">
                 {/* Chart Header */}
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                     <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-[1.25rem] bg-muted flex items-center justify-center text-xl font-black border border-border/50 shadow-inner">
                             {symbol[0]}
                         </div>
                         <div>
                             <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3">
                                 {symbol}
                                 <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-blue-500/20">
                                     NSE
                                 </span>
                             </h1>
                             <p className="text-muted-foreground font-medium text-sm">{stockInfo?.name}</p>
                         </div>
                     </div>

                     <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border/50 overflow-x-auto max-w-full">
                         {horizons.map((h) => (
                             <button
                                 key={h.value}
                                 onClick={() => setSelectedHorizon(h.value)}
                                 className={cn(
                                     "px-5 py-2 rounded-lg text-sm font-bold transition-all relative overflow-hidden whitespace-nowrap",
                                     selectedHorizon === h.value 
                                         ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                                         : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                 )}
                             >
                                 {h.label}
                                 {selectedHorizon === h.value && (
                                    <motion.div layoutId="horizon-active" className="absolute inset-0 border-2 border-primary/10 rounded-lg pointer-events-none" />
                                 )}
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* Chart Area */}
                 <div className="flex-1 w-full relative z-10 min-h-[380px]">
                     <StockChart 
                        data={history} 
                        predictions={data.predictions as any}
                        symbol={symbol}
                        period={selectedHorizon}
                    />
                 </div>
                 
                 {/* Chart Footer Stats */}
                 {stats && (
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-border/30 px-2">
                       <div className="space-y-0.5">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Day Open</p>
                           <p className="font-bold text-sm">₹{stats.dayOpen.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                       </div>
                       <div className="space-y-0.5">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Day High</p>
                           <p className="font-bold text-sm text-emerald-500">₹{stats.dayHigh.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                       </div>
                       <div className="space-y-0.5">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Day Low</p>
                           <p className="font-bold text-sm text-rose-500">₹{stats.dayLow.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                       </div>
                       <div className="space-y-0.5">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Volume</p>
                           <p className="font-bold text-sm">{(stats.volume / 1000000).toFixed(2)}M</p>
                       </div>
                       <div className="space-y-0.5">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Volatility (Ann.)</p>
                           <p className={cn("font-bold text-sm", stats.volatility > 0.30 ? "text-orange-500" : "text-emerald-500")}>
                               {(stats.volatility * 100).toFixed(2)}%
                           </p>
                       </div>
                   </div>
                 )}
              </div>

              {/* Bottom Grid: Signals & Model Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                     <TradingSignalCard 
                         prediction={data as unknown as Prediction}
                         history={history}
                     />
                  </div>
                  
                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
                      <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                          <Layers size={18} className="text-blue-500" />
                          Model Architecture
                      </h3>
                      
                      <div className="flex-1 space-y-4">
                          {/* Model Weights */}
                          <div className="space-y-2">
                              <div className="flex justify-between text-sm font-bold">
                                  <span>LSTM (Temporal)</span>
                                  <span className="text-emerald-500">60% Weight</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full w-[60%] transition-all duration-1000" />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <div className="flex justify-between text-sm font-bold">
                                  <span>XGBoost (Features)</span>
                                  <span className="text-blue-500">40% Weight</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full w-[40%] transition-all duration-1000" />
                              </div>
                          </div>

                          {/* Per-Horizon Predictions Summary */}
                          <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                              <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">All Horizons</p>
                              {Object.entries(data.predictions).map(([key, pred]) => (
                                <div key={key} className="flex items-center justify-between text-sm">
                                  <span className="font-bold text-muted-foreground">{key}</span>
                                  <div className="flex items-center gap-3">
                                    <span className={cn(
                                      "font-black",
                                      (pred.change_percent || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                      {(pred.change_percent || 0) >= 0 ? '+' : ''}{(pred.change_percent || 0).toFixed(2)}%
                                    </span>
                                    <span className="text-xs font-bold text-muted-foreground">
                                      ₹{pred.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>

                          <div className="mt-6 pt-6 border-t border-border/50">
                              <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                                  Hybrid LSTM-XGBoost ensemble trained on {sortedHistory.length}+ historical data points. 
                                  Predictions use log-return methodology for statistical stationarity.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
           </div>
        </div>
    </DashboardShell>
  );
}
