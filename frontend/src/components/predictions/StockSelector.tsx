"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search, ArrowUpRight } from 'lucide-react';
import { STOCK_SYMBOLS } from '@/lib/constants';
import { useRouter } from 'next/navigation';

interface StockSelectorProps {
  selectedSymbol?: string;
  className?: string;
  onSelect?: (symbol: string) => void;
}

export function StockSelector({ selectedSymbol, className, onSelect }: StockSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filteredSymbols = STOCK_SYMBOLS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStock = STOCK_SYMBOLS.find(s => s.symbol === selectedSymbol) || 
                     (selectedSymbol ? { symbol: selectedSymbol, name: selectedSymbol } : null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    if (onSelect) {
      onSelect(symbol);
    } else {
      router.push(`/predictions/${symbol}`);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative w-full max-w-sm ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 bg-card border border-border rounded-xl px-4 flex items-center justify-between hover:border-blue-500/50 hover:bg-muted/50 transition-all shadow-sm group"
      >
        <div className="flex flex-col items-start truncate">
          <span className="text-sm font-bold text-foreground group-hover:text-blue-500 transition-colors">
            {activeStock?.symbol || "Select Market"}
          </span>
          <span className="text-xs font-medium text-muted-foreground/70 truncate">
            {activeStock?.name || "Search NIFTY 50..."}
          </span>
        </div>
        <ChevronDown size={20} className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl shadow-blue-500/10 overflow-hidden max-h-80 flex flex-col backdrop-blur-xl"
          >
            <div className="p-3 border-b border-border bg-muted/30 sticky top-0 z-10">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Find ticker..."
                  className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-muted-foreground/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {filteredSymbols.length > 0 ? (
                filteredSymbols.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSelect(stock.symbol)}
                    className={`w-full px-3 py-3 rounded-lg flex items-center justify-between hover:bg-secondary/80 transition-all text-left group border border-transparent ${selectedSymbol === stock.symbol ? 'bg-blue-500/10 border-blue-500/20' : ''}`}
                  >
                    <div>
                        <div className={`font-bold text-sm tracking-tight flex items-center gap-2 ${selectedSymbol === stock.symbol ? 'text-blue-500' : 'text-foreground'}`}>
                           {stock.symbol}
                           {selectedSymbol === stock.symbol && <ArrowUpRight size={12} />}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium group-hover:text-foreground/80">{stock.name}</div>
                    </div>
                    {selectedSymbol === stock.symbol && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={16} className="text-blue-500" />
                        </motion.div>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground font-medium flex flex-col items-center gap-2">
                   <Search size={24} className="opacity-20" />
                   No results found suitable.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
