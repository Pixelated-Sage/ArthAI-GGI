"use client";

import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { ShieldCheck, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        title: "Hybrid AI Models",
        description: "Combining LSTM for long-term trends and XGBoost for short-term corrections.",
        icon: Activity
    },
    {
        title: "Sentiment Analysis",
        description: "Real-time processing of news and social sentiment to gauge market psychology.",
        icon: Zap
    },
    {
        title: "Risk-Adjusted Signals",
        description: "Predictions are weighed against volatility and historical performance.",
        icon: ShieldCheck
    }
];

export default function AboutPage() {
  return (
    <DashboardShell title="About Us" subtitle="Company">
      <div className="max-w-7xl mx-auto py-12">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-20"
        >
            <h1 className="text-5xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Arth AI
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
                We are democratizing institutional-grade market intelligence.
                <span className="block mt-2 font-medium text-foreground">
                    Built by engineers, powered by data, designed for traders.
                </span>
            </p>
        </motion.div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                <motion.div 
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2rem] bg-card border border-border hover:border-blue-500/30 transition-colors group"
                >
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
                );
            })}
        </div>
      </div>
    </DashboardShell>
  );
}
