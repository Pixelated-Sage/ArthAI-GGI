"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    TrendingDown, 
    Target, 
    ShieldAlert, 
    BarChart2, 
    Activity,
    Clock,
    Zap,
    AlertTriangle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Prediction, OHLCV } from '@/types/start';
import { calculateRSI, calculateVolatility } from '@/utils/indicators';

interface TradingSignalCardProps {
    prediction: Prediction;
    history: OHLCV[];
}

type Horizon = 'Day' | 'Swing' | 'Long';

export const TradingSignalCard = ({ prediction, history }: TradingSignalCardProps) => {
    const [horizon, setHorizon] = useState<Horizon>('Swing');

    const currentPrice = prediction.current_price;
    
    // Sort history ascending (oldest first) for correct calculation
    const sortedHistory = useMemo(() => {
        if (!history || history.length === 0) return [];
        return [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [history]);
    
    const prices = useMemo(() => sortedHistory.map(h => h.close), [sortedHistory]);

    // Calculate Indicators
    const rsi = useMemo(() => {
        // calculateRSI expects newest-first, so reverse
        return calculateRSI([...prices].reverse(), 14);
    }, [prices]);

    const volatility = useMemo(() => calculateVolatility([...prices].reverse(), 20), [prices]);
    
    // Calculate Recent Trend (Last 5 trading days)
    const recentTrend = useMemo(() => {
        if (prices.length < 5) return 0;
        const latestPrice = prices[prices.length - 1];
        const fiveDaysAgo = prices[prices.length - 5];
        return ((latestPrice - fiveDaysAgo) / fiveDaysAgo) * 100;
    }, [prices]);
    
    // Derive Signals using ACTUAL prediction data
    const activeSignal = useMemo(() => {
        let targetPrice = currentPrice;
        let bias: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
        let conviction: 'High' | 'Medium' | 'Low' = 'Medium';
        let stopLoss = 0;
        let takeProfit = 0;
        let reasoning = "";
        let expectedReturn = 0;
        let riskRewardRatio = 0;

        // Daily volatility (not annualized)
        const dailyVol = volatility / Math.sqrt(252);
        const volMult = Math.max(dailyVol, 0.01); // Min 1%

        const horizonMap: Record<Horizon, string> = {
            'Day': '1d',
            'Swing': '7d', 
            'Long': '30d'
        };

        const pred = prediction.predictions[horizonMap[horizon]];
        if (!pred) {
            return { bias: 'Neutral' as const, conviction: 'Low' as const, stopLoss: currentPrice, takeProfit: currentPrice, reasoning: "No prediction data available for this horizon.", targetPrice: currentPrice, expectedReturn: 0, riskRewardRatio: 0 };
        }

        targetPrice = pred.price;
        const change = pred.change_percent || ((targetPrice - currentPrice) / currentPrice) * 100;
        const rawConfidence = pred.confidence || 0.5;
        expectedReturn = change;

        // Determine signal strength based on horizon-specific thresholds
        if (horizon === 'Day') {
            // Day trading: Needs strong intraday signal
            const trendAligned = (change > 0 && recentTrend > -1) || (change < 0 && recentTrend < 1);
            
            if (change > 1.0 && trendAligned && (rsi || 50) < 70) {
                bias = 'Bullish';
                conviction = change > 2.0 && rawConfidence > 0.7 ? 'High' : 'Medium';
                reasoning = `Model predicts +${change.toFixed(2)}% upside today. ${recentTrend > 0 ? 'Momentum aligns with recent uptrend.' : 'Counter-trend setup.'}`;
            } else if (change < -1.0 && trendAligned && (rsi || 50) > 30) {
                bias = 'Bearish';
                conviction = change < -2.0 && rawConfidence > 0.7 ? 'High' : 'Medium';
                reasoning = `Model predicts ${change.toFixed(2)}% downside today. ${recentTrend < 0 ? 'Aligns with selling pressure.' : 'Potential reversal ahead.'}`;
            } else {
                bias = 'Neutral';
                conviction = 'Low';
                reasoning = `Predicted change of ${change > 0 ? '+' : ''}${change.toFixed(2)}% is within noise range. No actionable intraday signal.`;
            }

            // Stop loss: always relative to direction
            if (bias === 'Bullish') {
                stopLoss = currentPrice * (1 - volMult * 1.5);
                takeProfit = targetPrice;
            } else if (bias === 'Bearish') {
                // For display purposes (long-only view): show as exit signal
                stopLoss = currentPrice * (1 + volMult * 1.5);
                takeProfit = targetPrice;
            } else {
                stopLoss = currentPrice * (1 - volMult);
                takeProfit = currentPrice * (1 + volMult);
            }
        } 
        else if (horizon === 'Swing') {
            // Swing (7d): Medium-term positioning
            const trendWeight = recentTrend < -3.0 ? 3.0 : 1.5; // Need stronger signal against heavy downtrend
            
            if (change > trendWeight) {
                bias = 'Bullish';
                conviction = change > 4.0 && rawConfidence > 0.7 ? 'High' : 'Medium';
                reasoning = `7-day target ₹${targetPrice.toFixed(0)} (+${change.toFixed(2)}%). ${recentTrend < -2 ? 'Oversold bounce setup — higher risk.' : 'Trend-aligned bullish setup.'}`;
            } else if (change < -1.5) {
                bias = 'Bearish';
                conviction = change < -3.0 && rawConfidence > 0.7 ? 'High' : 'Medium';
                reasoning = `7-day target ₹${targetPrice.toFixed(0)} (${change.toFixed(2)}%). Bearish weekly outlook.`;
            } else {
                bias = 'Neutral';
                conviction = 'Low';
                reasoning = `Predicted ${change > 0 ? '+' : ''}${change.toFixed(2)}% over 7 days — sideways consolidation expected.`;
            }

            if (bias === 'Bullish') {
                stopLoss = currentPrice * (1 - volMult * 5);
                takeProfit = targetPrice;
            } else if (bias === 'Bearish') {
                stopLoss = currentPrice * (1 + volMult * 5);
                takeProfit = targetPrice;
            } else {
                stopLoss = currentPrice * (1 - volMult * 3);
                takeProfit = currentPrice * (1 + volMult * 3);
            }
        }
        else { // Long (30d)
            if (change > 3.0) {
                bias = 'Bullish';
                conviction = change > 7.0 && rawConfidence > 0.7 ? 'High' : 'Medium';
                reasoning = `30-day target ₹${targetPrice.toFixed(0)} (+${change.toFixed(2)}%). Strong monthly growth projected.`;
            } else if (change < -3.0) {
                bias = 'Bearish';
                conviction = change < -7.0 && rawConfidence > 0.7 ? 'High' : 'Medium';
                reasoning = `30-day target ₹${targetPrice.toFixed(0)} (${change.toFixed(2)}%). Correction phase anticipated.`;
            } else {
                bias = 'Neutral';
                conviction = 'Low';
                reasoning = `Predicted ${change > 0 ? '+' : ''}${change.toFixed(2)}% over 30 days — unclear long-term direction.`;
            }

            if (bias === 'Bullish') {
                stopLoss = currentPrice * (1 - volMult * 10);
                takeProfit = targetPrice;
            } else if (bias === 'Bearish') {
                stopLoss = currentPrice * (1 + volMult * 10);
                takeProfit = targetPrice;
            } else {
                stopLoss = currentPrice * (1 - volMult * 7);
                takeProfit = currentPrice * (1 + volMult * 7);
            }
        }

        // Calculate Risk/Reward
        const risk = Math.abs(currentPrice - stopLoss);
        const reward = Math.abs(takeProfit - currentPrice);
        riskRewardRatio = risk > 0 ? reward / risk : 0;

        return { bias, conviction, stopLoss, takeProfit, reasoning, targetPrice, expectedReturn, riskRewardRatio };
    }, [horizon, prediction, rsi, volatility, currentPrice, recentTrend]);

    const isBullish = activeSignal.bias === 'Bullish';
    const isBearish = activeSignal.bias === 'Bearish';
    const isNeutral = activeSignal.bias === 'Neutral';

    const signalLabel = isBullish 
        ? (activeSignal.conviction === 'High' ? 'STRONG BUY' : 'BUY')
        : isBearish 
            ? (activeSignal.conviction === 'High' ? 'STRONG SELL' : 'SELL')
            : 'HOLD';

    const signalColor = isBullish ? 'emerald' : isBearish ? 'rose' : 'slate';

    return (
        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl shadow-blue-900/5 relative group">
            {/* Ambient Background */}
            <div className={cn(
                "absolute inset-0 opacity-[0.03] transition-colors duration-500",
                isBullish ? "bg-emerald-500" : isBearish ? "bg-rose-500" : "bg-slate-500"
            )} />

            {/* Header */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-300",
                            `bg-${signalColor}-500/10 text-${signalColor}-500`
                        )}
                        style={{
                            backgroundColor: isBullish ? 'rgba(16,185,129,0.1)' : isBearish ? 'rgba(244,63,94,0.1)' : 'rgba(100,116,139,0.1)',
                            color: isBullish ? '#10b981' : isBearish ? '#f43f5e' : '#64748b'
                        }}
                        >
                            <Zap size={24} className={cn(isBullish || isBearish ? "fill-current" : "")} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">AI Trade Assistant</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Signal Engine</p>
                        </div>
                    </div>
                    
                    {/* Horizon Tabs */}
                    <div className="flex bg-muted/50 p-1 rounded-xl">
                        {(['Day', 'Swing', 'Long'] as Horizon[]).map((h) => (
                            <button
                                key={h}
                                onClick={() => setHorizon(h)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    horizon === h 
                                     ? "bg-background shadow-sm text-foreground scale-105" 
                                     : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {h === 'Day' ? '1D' : h === 'Swing' ? '7D' : '30D'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Signal Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   {/* Left: Bias & Action */}
                   <div className="bg-background/60 backdrop-blur-md rounded-[2rem] p-6 border border-border/50 flex flex-col justify-center items-center text-center relative overflow-hidden transition-all duration-300">
                        <div className="absolute inset-0 opacity-[0.06] transition-colors duration-500" 
                            style={{ backgroundColor: isBullish ? '#10b981' : isBearish ? '#f43f5e' : '#64748b' }}
                        />
                        
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Signal</span>
                        
                        <motion.div
                            key={signalLabel}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="text-3xl font-black tracking-tighter mb-1 flex items-center gap-2"
                            style={{ color: isBullish ? '#10b981' : isBearish ? '#f43f5e' : '#64748b' }}
                        >
                            {isBullish && <ArrowUpRight size={28} />}
                            {isBearish && <ArrowDownRight size={28} />}
                            {isNeutral && <Minus size={28} />}
                            {signalLabel}
                        </motion.div>

                        <div className="flex items-center gap-2 text-sm font-bold opacity-80 mb-3">
                            {activeSignal.conviction} Conviction
                            {activeSignal.conviction === 'High' && <CheckCircle2 size={14} />}
                        </div>

                        {/* Expected Return */}
                        <div className="flex items-center gap-2" style={{ color: activeSignal.expectedReturn >= 0 ? '#10b981' : '#f43f5e' }}>
                            {activeSignal.expectedReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span className="text-xl font-black">
                                {activeSignal.expectedReturn >= 0 ? '+' : ''}{activeSignal.expectedReturn.toFixed(2)}%
                            </span>
                        </div>
                        
                        {/* Risk/Reward */}
                        {activeSignal.riskRewardRatio > 0 && !isNeutral && (
                            <div className="mt-2 text-xs font-bold text-muted-foreground">
                                R:R {activeSignal.riskRewardRatio.toFixed(1)}:1
                            </div>
                        )}
                   </div>
                   
                   {/* Right: Price Targets */}
                   <div className="flex flex-col gap-3">
                        {/* Current Price */}
                        <div className="flex justify-between items-center p-4 bg-background/40 rounded-2xl border border-border/40">
                            <div className="flex items-center gap-3">
                                <Activity size={16} className="text-blue-500" />
                                <span className="text-sm font-bold text-muted-foreground">Current</span>
                            </div>
                            <span className="text-lg font-black tracking-tight">
                                ₹{currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Target Price */}
                        <div className="flex justify-between items-center p-4 bg-background/40 rounded-2xl border border-border/40">
                            <div className="flex items-center gap-3">
                                <Target size={16} className="text-emerald-500" />
                                <span className="text-sm font-bold text-muted-foreground">Target</span>
                            </div>
                            <motion.span 
                                key={activeSignal.takeProfit}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-lg font-black tracking-tight"
                                style={{ color: activeSignal.takeProfit > currentPrice ? '#10b981' : activeSignal.takeProfit < currentPrice ? '#f43f5e' : undefined }}
                            >
                                ₹{activeSignal.takeProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </motion.span>
                        </div>

                        {/* Stop Loss */}
                        <div className="flex justify-between items-center p-4 bg-background/40 rounded-2xl border border-border/40">
                            <div className="flex items-center gap-3">
                                <ShieldAlert size={16} className="text-rose-500" />
                                <span className="text-sm font-bold text-muted-foreground">Stop Loss</span>
                            </div>
                            <motion.span 
                                key={activeSignal.stopLoss}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-lg font-black tracking-tight text-rose-500"
                            >
                                ₹{activeSignal.stopLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </motion.span>
                        </div>
                   </div>
                </div>

                {/* Reasoning Footer */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex gap-4 items-start">
                    <Activity size={20} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 mb-1">Model Reasoning</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                            {activeSignal.reasoning}
                            {` Daily volatility: ${(volatility / Math.sqrt(252) * 100).toFixed(2)}%.`}
                            {rsi && ` RSI(14): ${rsi.toFixed(1)}.`}
                            {` Recent 5D trend: ${recentTrend >= 0 ? '+' : ''}${recentTrend.toFixed(2)}%.`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
