"use client";

import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PortfolioPage() {
  const { user } = useAuth(); // Just check if auth works

  return (
    <DashboardShell title="Portfolio" subtitle="Tracking">
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md"
        >
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                <Clock size={40} />
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tight">Portfolio Tracking</h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Seamlessly connect your brokerage accounts and track your performance with AI-driven insights. 
                <span className="block mt-2 font-bold text-blue-500">Coming Spring 2026.</span>
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                Notify Me
            </button>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
