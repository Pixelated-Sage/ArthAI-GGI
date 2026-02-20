"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2, Play } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function LoginPage() {
  const { signInWithGoogle, user, loading: authLoading, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // AuthContext handles redirect
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (authLoading) return null; // Or skeleton

  if (user) {
      router.replace('/dashboard');
      return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 bg-blue-600 relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-50 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-50 -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 max-w-lg">
           <h1 className="text-5xl font-black mb-6 tracking-tight">
             Master the Market with AI
           </h1>
           <p className="text-blue-100 text-lg leading-relaxed mb-8 font-medium">
             Join thousands of traders using Arth's hybrid LSTM-XGBoost models to gain an unfair advantage.
           </p>
           
           <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                 <div className="text-3xl font-black mb-1">94%</div>
                 <div className="text-xs uppercase tracking-widest opacity-80 font-bold">Model Accuracy</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                 <div className="text-3xl font-black mb-1">24/7</div>
                 <div className="text-xs uppercase tracking-widest opacity-80 font-bold">Real-time Signals</div>
              </div>
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold text-sm transition-colors">
           <ArrowLeft size={16} />
           Back to Home
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground font-medium mt-2">Sign in to access your dashboard</p>
          </div>

          {authError && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-500/20"
             >
                <AlertCircle size={18} />
                {authError}
             </motion.div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-14 bg-white dark:bg-zinc-900 border border-input hover:bg-accent hover:text-accent-foreground text-foreground rounded-2xl font-bold flex items-center justify-center gap-3 transition-all relative overflow-hidden group shadow-sm hover:shadow-md"
            >
               {loading ? (
                   <Loader2 size={20} className="animate-spin text-muted-foreground" />
               ) : (
                   <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                   </>
               )}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-bold tracking-wider">
                  Access requires verification
                </span>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground font-medium leading-relaxed">
               By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
