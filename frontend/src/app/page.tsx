"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  ChevronRight,
  Globe,
  PieChart
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-cyan-500/10 blur-[100px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold mb-6"
            >
              <Zap size={14} />
              <span>Next-Gen Market Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              Predict the Future <br />
              <span className="text-gradient">of Finance</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-10"
            >
              Harness the power of Hybrid ML and Sentiment Analysis to unlock institutional-grade insights for Stocks and Crypto.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                href="/predictions"
                className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-transform shadow-lg shadow-primary/20"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link 
                href="/about"
                className="w-full sm:w-auto glass px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-accent transition-colors"
              >
                How it Works
              </Link>
            </motion.div>

            {/* Mock Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
              <div className="flex border-b border-border/50 p-4 gap-2 items-center">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="ml-4 h-6 w-1/3 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="h-64 bg-muted/30 rounded-xl relative overflow-hidden group">
                     {/* Static Chart Representation */}
                     <div className="absolute inset-0 flex items-end justify-between px-6 pb-6 pt-12">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 100].map((h, i) => (
                           <div key={i} className="w-8 bg-blue-500/40 rounded-t-md transition-all group-hover:bg-blue-500/60" style={{ height: `${h}%` }} />
                        ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-muted/20 rounded-xl" />
                    <div className="h-32 bg-muted/20 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-muted/20 rounded-xl flex items-center px-4 gap-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <TrendingUp size={16} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 bg-muted rounded" />
                        <div className="h-2 w-1/2 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Intelligence</h2>
              <p className="text-muted-foreground">Advanced modules designed for precision and performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<BarChart3 />}
                title="Hybrid ML Predictions"
                description="Our proprietary ensemble of LSTM, XGBoost, and Transformers delivers market-leading accuracy."
              />
              <FeatureCard 
                icon={<Globe />}
                title="Global Sentiment"
                description="Real-time sentiment analysis from News, Reddit, and Twitter using specialized FinGPT models."
              />
              <FeatureCard 
                icon={<PieChart />}
                title="Portfolio Optimization"
                description="Identify risks and rebalance your holdings with AI-driven allocation recommendations."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-12 text-center text-muted-foreground text-sm">
        <p>© 2026 FinPredict AI. All market data is delayed by 15 mins. Use for educational purposes.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-blue-500/50 hover:shadow-xl transition-all group">
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      <Link href="#" className="mt-6 flex items-center gap-1 text-sm font-semibold text-blue-500 hover:gap-2 transition-all">
        Learn more <ChevronRight size={16} />
      </Link>
    </div>
  );
}
