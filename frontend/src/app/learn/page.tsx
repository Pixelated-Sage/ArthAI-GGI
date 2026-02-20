"use client";

import React, { useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ChevronRight, X, BarChart2, DollarSign, Brain, Target, ShieldCheck, 
  Globe, Zap, PieChart, Users, Check, Briefcase, Calculator, Star, Coffee, Flag, 
  ArrowLeft, ArrowRight, Clock, Award
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { modules, consultants, pricingTiers, ModuleData, ChapterData, QuizQuestion } from './modules'; 

// --- Icons Map ---
const iconMap: Record<string, React.ElementType> = {
  Coffee, Globe, BarChart2, Target, ShieldCheck, Brain, Zap, Flag, PieChart
};

export default function LearnPage() {
  const [activeModule, setActiveModule] = useState<ModuleData | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reset state when opening a new module
  const handleOpenModule = (module: ModuleData) => {
    setActiveModule(module);
    setActiveChapterIndex(0);
    setShowQuiz(false);
    setQuizScore(0);
    setSelectedAnswers(new Array(module.quiz.length).fill(-1));
    setQuizSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizSubmit = () => {
    if (!activeModule) return;
    let score = 0;
    activeModule.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) score++;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleConsultationBook = (tierName: string) => {
    // In a real app, this would open a booking modal or redirect to Stripe/Calendly
    alert(`Booking feature coming soon for ${tierName}!`); 
  };

  // Render hero section
  const renderHero = () => (
    <div className="relative text-center max-w-5xl mx-auto mb-20 pt-10">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-sm mb-6 border border-indigo-500/20"
        >
            <BookOpen size={16} /> <span className="uppercase tracking-wider">ArthAI Learning Hub</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pb-2">
            Master the Markets.
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
            From absolute beginner to algorithmic trader. <br className="hidden md:block"/> 
            Interactive modules, real-world Indian market examples, and AI-powered insights.
        </p>
        
        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
            {[
                { label: "Modules", value: "9+", icon: BookOpen },
                { label: "Chapters", value: "45+", icon:  Briefcase},
                { label: "Quizzes", value: "100+", icon: Brain },
                { label: "Students", value: "1.2k", icon: Users },
            ].map((stat, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                >
                    <div className="bg-muted p-2 rounded-lg text-foreground">
                        <stat.icon size={20} />
                    </div>
                    <div className="text-left">
                        <div className="text-2xl font-black">{stat.value}</div>
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Learning Paths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto bg-muted/30 p-2 rounded-2xl border border-border/50">
             {['Beginner', 'Intermediate', 'Advanced'].map((level, i) => (
                 <button key={level} className={cn(
                     "py-3 px-6 rounded-xl font-bold transition-all",
                     i === 0 ? "bg-background shadow-sm text-indigo-600 border border-border" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                 )}>
                     {level} Path
                 </button>
             ))}
        </div>
    </div>
  );

  // Render Module Cards Grid
  const renderModuleGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
        {modules.map((module, i) => {
            const Icon = iconMap[module.icon] || BookOpen;
            return (
                <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.05) }}
                    onClick={() => handleOpenModule(module)}
                    className="group cursor-pointer relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-[2rem] transform group-hover:scale-[1.02] transition-transform duration-500" />
                    <div className="bg-card border border-border/60 hover:border-indigo-500/30 p-8 rounded-[2rem] relative z-10 h-full flex flex-col transition-all hover:shadow-xl hover:shadow-indigo-500/10">
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", module.color)}>
                                <Icon size={28} />
                            </div>
                            <span className="bg-muted px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {module.estimatedTime}
                            </span>
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">{module.title}</h3>
                        <p className="text-muted-foreground leading-relax mb-8 flex-grow text-sm">{module.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-0 group-hover:w-1/3 transition-all duration-700" />
                                </div>
                                <span className="text-xs font-bold text-muted-foreground">0%</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        })}
    </div>
  );

  // Render Full Page Module View
  const renderActiveModule = () => {
    if (!activeModule) return null;
    const Icon = iconMap[activeModule.icon] || BookOpen;
    const currentChapter = activeModule.chapters[activeChapterIndex];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto"
        >
            {/* Module Top Bar */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border h-20 flex items-center justify-between px-6 lg:px-12">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setActiveModule(null)}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm", activeModule.color)}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-none">{activeModule.title}</h2>
                            <p className="text-xs text-muted-foreground mt-1">Chapter {activeChapterIndex + 1} of {activeModule.chapters.length}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                         <Clock size={14} /> {activeModule.estimatedTime}
                    </div>
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden hidden md:block">
                        <div 
                            className="h-full bg-indigo-500 transition-all duration-500" 
                            style={{ width: `${((activeChapterIndex + 1) / activeModule.chapters.length) * 100}%` }} 
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
                
                {/* Sidebar Navigation */}
                <div className="lg:w-80 border-r border-border p-6 bg-muted/10 hidden lg:block h-[calc(100vh-80px)] sticky top-20 overflow-y-auto">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-6">Table of Contents</h3>
                    <div className="space-y-2">
                        {activeModule.chapters.map((chapter, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setActiveChapterIndex(idx); setShowQuiz(false); }}
                                className={cn(
                                    "w-full text-left p-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3",
                                    activeChapterIndex === idx 
                                        ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20" 
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs border",
                                    activeChapterIndex === idx ? "bg-indigo-500 text-white border-transparent" : "border-border bg-background"
                                )}>
                                    {idx + 1}
                                </span>
                                {chapter.title}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowQuiz(true)}
                            className={cn(
                                "w-full text-left p-3 rounded-lg text-sm font-bold transition-all flex items-center gap-3 mt-6",
                                showQuiz 
                                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" 
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                             <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-amber-500 text-white">
                                <Award size={14} />
                             </div>
                             Module Quiz
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 lg:p-12 lg:pl-16 max-w-4xl">
                    {!showQuiz ? (
                        <motion.div
                            key={activeChapterIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                           <div className="mb-10">
                               <span className="text-indigo-500 font-bold tracking-wider text-sm uppercase mb-2 block">Chapter {activeChapterIndex + 1}</span>
                               <h1 className="text-4xl font-black mb-6 leading-tight">{currentChapter.title}</h1>
                               <div className="h-1 w-20 bg-indigo-500 rounded-full" />
                           </div>

                           <div className="space-y-12">
                               {currentChapter.sections.map((section, idx) => (
                                   <div key={idx} className="group">
                                       <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                           {section.heading}
                                       </h3>
                                       
                                       {section.type === 'callout' && (
                                           <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-500/20 my-6 border border-indigo-500/50 relative overflow-hidden">
                                               <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
                                               <div className="relative z-10 font-medium text-lg leading-relaxed">
                                                   "{section.body}"
                                               </div>
                                           </div>
                                       )}

                                       {section.type === 'tip' && (
                                           <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl my-6 flex gap-4">
                                               <div className="bg-emerald-500 text-white p-2 rounded-lg h-fit shrink-0">
                                                   <Zap size={20} />
                                               </div>
                                               <div>
                                                   <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">Pro Tip</h4>
                                                   <p className="text-emerald-900 dark:text-emerald-100 leading-relaxed">{section.body}</p>
                                               </div>
                                           </div>
                                       )}

                                       {section.type === 'warning' && (
                                           <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl my-6 flex gap-4">
                                               <div className="bg-rose-500 text-white p-2 rounded-lg h-fit shrink-0">
                                                   <ShieldCheck size={20} />
                                               </div>
                                               <div>
                                                   <h4 className="font-bold text-rose-700 dark:text-rose-400 mb-2">Risk Warning</h4>
                                                   <p className="text-rose-900 dark:text-rose-100 leading-relaxed">{section.body}</p>
                                               </div>
                                           </div>
                                       )}
                                       
                                       {section.type === 'example' && (
                                           <div className="bg-blue-500/5 border border-dashed border-blue-500/30 p-6 rounded-2xl my-6">
                                               <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2"><Target size={18}/> Example</h4>
                                               <p className="text-muted-foreground italic">{section.body}</p>
                                           </div>
                                       )}

                                       {!section.type && (
                                           <p className="text-lg text-muted-foreground leading-relaxed">
                                               {section.body}
                                           </p>
                                       )}
                                   </div>
                               ))}
                           </div>

                           {/* Navigation Buttons */}
                           <div className="flex justify-between items-center mt-20 pt-10 border-t border-border">
                               <button
                                   onClick={() => {
                                       if (activeChapterIndex > 0) setActiveChapterIndex(prev => prev - 1);
                                   }}
                                   disabled={activeChapterIndex === 0}
                                   className="flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-muted font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                               >
                                   <ArrowLeft size={18} /> Previous
                               </button>

                               {activeChapterIndex < activeModule.chapters.length - 1 ? (
                                   <button
                                       onClick={() => setActiveChapterIndex(prev => prev + 1)}
                                       className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                                   >
                                       Next Chapter <ArrowRight size={18} />
                                   </button>
                               ) : (
                                   <button
                                       onClick={() => setShowQuiz(true)}
                                       className="flex items-center gap-2 px-8 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 animate-pulse"
                                   >
                                       Take Quiz <Award size={18} />
                                   </button>
                               )}
                           </div>
                        </motion.div>
                    ) : (
                        // QUZI SECTION
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <Award size={32} />
                                </div>
                                <h2 className="text-3xl font-black mb-2">Module Quiz</h2>
                                <p className="text-muted-foreground">Test your knowledge to complete this module.</p>
                            </div>

                            {!quizSubmitted ? (
                                <div className="space-y-8">
                                    {activeModule.quiz.map((q, idx) => (
                                        <div key={idx} className="bg-card border border-border p-6 rounded-2xl">
                                            <h3 className="text-lg font-bold mb-4 flex gap-3">
                                                <span className="text-muted-foreground">{idx + 1}.</span> 
                                                {q.question}
                                            </h3>
                                            <div className="space-y-3">
                                                {q.options.map((option, optIdx) => (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => {
                                                            const newAnswers = [...selectedAnswers];
                                                            newAnswers[idx] = optIdx;
                                                            setSelectedAnswers(newAnswers);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group",
                                                            selectedAnswers[idx] === optIdx 
                                                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-md ring-1 ring-indigo-500" 
                                                                : "border-border hover:bg-muted"
                                                        )}
                                                    >
                                                        {option}
                                                        {selectedAnswers[idx] === optIdx && <Check size={18} className="text-indigo-500" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="pt-8 flex justify-center">
                                        <button
                                            onClick={handleQuizSubmit}
                                            disabled={selectedAnswers.includes(-1)}
                                            className="px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20 transition-all hover:scale-105"
                                        >
                                            Submit Answers
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center bg-card border border-border p-10 rounded-3xl shadow-2xl">
                                    <h3 className="text-2xl font-bold mb-2">Quiz Results</h3>
                                    <div className="text-6xl font-black text-indigo-600 mb-6">{quizScore} / {activeModule.quiz.length}</div>
                                    
                                    <p className="text-lg mb-8">
                                        {quizScore === activeModule.quiz.length 
                                            ? "🎉 Perfect Score! You're a master." 
                                            : quizScore > activeModule.quiz.length / 2 
                                                ? "👍 Good job! Keep practicing." 
                                                : "📚 Review the chapters and try again."}
                                    </p>

                                    <div className="flex gap-4 justify-center">
                                        <button 
                                            onClick={() => {
                                                setQuizSubmitted(false);
                                                setSelectedAnswers(new Array(activeModule.quiz.length).fill(-1));
                                            }}
                                            className="px-6 py-2 rounded-lg border border-border hover:bg-muted font-medium"
                                        >
                                            Retake Quiz
                                        </button>
                                        <button 
                                            onClick={() => setActiveModule(null)}
                                            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                                        >
                                            Finish Module
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
  };

  // Consultation Section
  const renderConsultation = () => (
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white rounded-[3rem] p-10 md:p-20 relative overflow-hidden mb-32">
          {/* Abstract blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 animate-pulse" />

          <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-20">
                  <h2 className="text-4xl md:text-5xl font-black mb-6">Expert Guidance. <br/>Personalized for You.</h2>
                  <p className="text-xl text-indigo-100/80">
                      Need help building your portfolio? Confused about F&O taxes? 
                      Book a 1-on-1 session with our SEBI-registered experts.
                  </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
                  {pricingTiers.map((tier, i) => (
                      <div key={i} className={cn(
                          "rounded-[2rem] p-8 relative flex flex-col transition-all duration-300 hover:-translate-y-2",
                          tier.highlight 
                              ? "bg-white text-slate-900 shadow-2xl shadow-indigo-500/30 scale-105" 
                              : "bg-white/5 backdrop-blur-lg border border-white/10 text-white hover:bg-white/10"
                      )}>
                          {tier.highlight && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                  {tier.badge}
                              </div>
                          )}
                          <div className="mb-6">
                              <h3 className="text-lg font-bold opacity-80">{tier.name}</h3>
                              <div className="flex items-baseline gap-1 mt-2">
                                  <span className="text-4xl font-black">{tier.price}</span>
                                  <span className="text-sm opacity-60">/{tier.period}</span>
                              </div>
                          </div>
                          
                          <div className="space-y-4 mb-8 flex-grow">
                              {tier.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-start gap-3 text-sm">
                                      <div className={cn("mt-1 p-0.5 rounded-full flex items-center justify-center shrink-0", tier.highlight ? "bg-indigo-100 text-indigo-600" : "bg-white/10 text-indigo-300")}>
                                          <Check size={10} />
                                      </div>
                                      <span className="opacity-90">{feature}</span>
                                  </div>
                              ))}
                          </div>

                          <button 
                              onClick={() => handleConsultationBook(tier.name)}
                              className={cn(
                                  "w-full py-4 rounded-xl font-bold transition-all",
                                  tier.highlight 
                                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30" 
                                      : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                              )}
                          >
                              {tier.cta}
                          </button>
                      </div>
                  ))}
              </div>

              {/* Consultants */}
              <div className="text-center">
                  <h3 className="text-2xl font-bold mb-8 text-white/80">Meet Our Experts</h3>
                  <div className="flex flex-wrap justify-center gap-8">
                      {consultants.map((consultant, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl pr-8 hover:bg-white/10 transition-colors cursor-pointer">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                                  {consultant.avatar}
                              </div>
                              <div className="text-left">
                                  <h4 className="font-bold text-lg">{consultant.name}</h4>
                                  <p className="text-xs text-indigo-200 uppercase tracking-wider font-bold mb-1">{consultant.title}</p>
                                  <p className="text-xs text-white/60">{consultant.specialization}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <DashboardShell title="Learning Hub" subtitle="Education">
      <div className="max-w-7xl mx-auto pb-20 selection:bg-indigo-500/30 min-h-screen">
        
        {/* Main Page Content */}
        {renderHero()}
        
        <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain size={24} className="text-indigo-500"/> Modules
            </h2>
            <div className="hidden md:flex items-center gap-2 bg-muted/50 p-1 rounded-lg text-sm">
                <button className="px-3 py-1 bg-background text-foreground shadow-sm rounded-md font-medium">All</button>
                <button className="px-3 py-1 text-muted-foreground hover:text-foreground transition-colors">Beginner</button>
                <button className="px-3 py-1 text-muted-foreground hover:text-foreground transition-colors">Advanced</button>
            </div>
        </div>

        {renderModuleGrid()}
        {renderConsultation()}

        {/* Featured Course Banner */}
        <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 mb-20">
            <div className="flex items-center gap-4">
                <div className="bg-amber-500 text-white p-3 rounded-xl">
                    <Star size={24} fill="currentColor" />
                </div>
                <div>
                    <h3 className="font-bold text-amber-900 dark:text-amber-100 text-lg">New: Options Trading Masterclass</h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">Learn strategies like Iron Condor & Straddle from Ex-Goldman Sachs traders.</p>
                </div>
            </div>
            <button className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors whitespace-nowrap">
                Coming Soon
            </button>
        </div>

        {/* Full Page Module Viewer Overlay */}
        <AnimatePresence>
            {activeModule && renderActiveModule()}
        </AnimatePresence>

      </div>
    </DashboardShell>
  );
}
