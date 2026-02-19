"use client";

import React, { useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, TrendingUp, Cpu, ChevronRight, X, PlayCircle, BarChart2, DollarSign } from 'lucide-react';
import { cn } from '@/utils/cn';


import { modules, Module } from './content';

export default function LearnPage() {
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  return (
    <DashboardShell title="Learning Hub" subtitle="Education">
      <div className="max-w-7xl mx-auto pb-20 selection:bg-indigo-500/30">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-sm mb-6"
            >
                <BookOpen size={16} /> Learning Hub
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                Master the Market.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
                Whether you're a beginner or a pro, our curated guides will help you understand financial concepts and maximize FinPredict's AI potential.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {modules.map((module, i) => (
                <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setActiveModule(module)}
                    className="group cursor-pointer relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-[2.5rem] transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="bg-card border border-border hover:border-indigo-500/30 p-8 rounded-[2.5rem] relative z-10 h-full flex flex-col transition-colors">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", module.color)}>
                            <module.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-500 transition-colors">{module.title}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">{module.description}</p>
                        
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground group-hover:translate-x-2 transition-transform">
                            Start Learning <ChevronRight size={16} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Floating AI Tip */}
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="fixed bottom-8 right-8 max-w-xs bg-indigo-600 text-white p-6 rounded-3xl shadow-2xl shadow-indigo-600/40 hidden md:block"
        >
            <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg shrink-0">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-1">Pro Tip</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed">Combine our "Market Fundamentals" with live analysis on the Predictions page for the best results.</p>
                </div>
            </div>
        </motion.div>

        {/* Module Content Modal */}
        <AnimatePresence>
            {activeModule && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
                    onClick={() => setActiveModule(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-card border border-border w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md", activeModule.color)}>
                                    <activeModule.icon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">{activeModule.title}</h2>
                                    <p className="text-sm text-muted-foreground font-medium">Interactive Guide</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveModule(null)}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-8 space-y-12">
                            {activeModule.chapters.map((chapter, i) => (
                                <div key={i} className="bg-background border border-border rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-transparent opacity-50" />
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-black">{i + 1}</span>
                                        {chapter.title}
                                    </h3>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        {chapter.content}
                                    </div>
                                </div>
                            ))}
                            
                            <div className="flex justify-center pt-8">
                                <button 
                                    onClick={() => setActiveModule(null)}
                                    className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                                >
                                    Complete Module
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
