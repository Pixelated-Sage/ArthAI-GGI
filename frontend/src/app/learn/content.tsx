import React from 'react';
import { BookOpen, TrendingUp, Cpu, BarChart2, DollarSign, Activity, Globe, ShieldCheck, Clock, Target, Zap, Search, AlertTriangle, Coffee, Brain, Anchor, Eye } from 'lucide-react';

export interface Chapter {
  title: string;
  content: React.ReactNode;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType; 
  color: string;
  chapters: Chapter[];
}

export const modules: Module[] = [
  {
    id: "module-0",
    title: "Module 0: The Absolute Basics",
    description: "Start here if you have 0 knowledge. We explain stocks using a Lemonade Stand.",
    icon: Coffee,
    color: "bg-emerald-500",
    chapters: [
      {
        title: "The Lemonade Stand Metaphor",
        content: (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Imagine a Lemonade Stand 🍋</h3>
            <p>You have a great lemonade recipe, but you need $100 to buy a stand, lemons, and sugar. You only have $50.</p>
            <p>You ask your friend, <strong>Bob</strong>, for the other $50. In exchange, you give him a piece of paper that says:</p>
            <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-muted-foreground my-4">
              "Bob owns 50% of this Lemonade Stand. He gets 50% of the profits."
            </blockquote>
            <p><strong>Congratulations! You just issued stock.</strong></p>
            <ul className="list-disc pl-5 space-y-2 mt-4">
               <li>The <strong>Company</strong> is the Lemonade Stand.</li>
               <li>The <strong>Stock</strong> is that piece of paper.</li>
               <li>The <strong>Shareholder</strong> is Bob.</li>
            </ul>
             <div className="bg-muted p-4 rounded-xl border border-border mt-4">
                <h4 className="font-bold flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-emerald-500"/> Why do this?</h4>
                <p className="text-sm">You (the company) get money to grow without paying interest (like a loan). Bob (the investor) hopes the stand becomes huge so his 50% is worth millions one day.</p>
            </div>
          </div>
        )
      },
      {
        title: "Going Public (The IPO)",
        content: (
          <div className="space-y-4">
            <p>Now imagine your Lemonade Stand becomes a global franchise. You need $1 Billion to build factories. You can't just ask Bob anymore.</p>
            <p>You go to the <strong>Stock Market</strong> (like a supermarket for stocks) and sell millions of tiny pieces of paper to the public.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                 <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                    <h5 className="font-bold text-blue-600 mb-1">IPO (Initial Public Offering)</h5>
                    <p className="text-xs">The first day your stock is sold to the public. It's the "Birth" of a public company.</p>
                 </div>
                 <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                    <h5 className="font-bold text-purple-600 mb-1">Ticker Symbol</h5>
                    <p className="text-xs">A nickname for your stock. Apple is <strong>AAPL</strong>. Tesla is <strong>TSLA</strong>. Your stand might be <strong>LMND</strong>.</p>
                 </div>
            </div>
          </div>
        )
      },
      {
        title: "Why Prices Move?",
        content: (
            <div className="space-y-4">
                <p>Stock prices flash red and green all day. Why?</p>
                <h4 className="font-bold text-lg">Supply and Demand</h4>
                <p>Imagine it's a hot day (Good News). Everyone wants lemonade. Bob wants to sell his share.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Alice offers $50.</li>
                    <li>Charlie offers $60.</li>
                    <li>Bob sells to Charlie for $60. <strong>The stock price is now $60.</strong></li>
                </ul>
                <p className="mt-4">If it rains (Bad News), nobody wants lemonade. Bob might have to sell his share for $40 just to get out. <strong>The price drops to $40.</strong></p>
                <p className="bg-muted p-3 rounded-lg text-sm mt-2"><strong>Key Takeaway:</strong> The stock market is just millions of people arguing about what the Lemonade Stand is worth <em>right now</em>.</p>
            </div>
        )
      }
    ]
  },
  {
    id: "mechanics",
    title: "Module 1: Market Mechanics",
    description: "How to actually buy. Bids, Asks, and the 'Spread' explained.",
    icon: Globe,
    color: "bg-blue-500",
    chapters: [
      {
        title: "The Bid-Ask Spread",
        content: (
            <div className="space-y-4">
                <p>When you look at a stock price, you actually see two prices.</p>
                <div className="flex items-center justify-around bg-card p-6 rounded-2xl border border-border">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Bid</p>
                        <p className="text-2xl font-black text-emerald-500">$100.00</p>
                        <p className="text-[10px] text-muted-foreground">Highest price a BUYER will pay</p>
                    </div>
                    <div className="h-10 w-px bg-border"></div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Ask</p>
                        <p className="text-2xl font-black text-rose-500">$100.05</p>
                        <p className="text-[10px] text-muted-foreground">Lowest price a SELLER will accept</p>
                    </div>
                </div>
                <p className="text-sm mt-2">The difference ($0.05) is the <strong>Spread</strong>. This is often how "free" trading apps make money.</p>
                <p className="text-sm"><strong>If you want to buy INSTANTLY, you pay the Ask ($100.05).</strong></p>
            </div>
        )
      },
      {
        title: "Order Types: Market vs Limit",
        content: (
            <div className="space-y-4">
                <p>Don't just click "Buy". Choose how you buy.</p>
                
                <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4 py-1">
                        <h5 className="font-bold flex items-center gap-2"><Zap size={16}/> Market Order</h5>
                        <p className="text-sm">"Get me in NOW at any price!"</p>
                        <p className="text-xs text-muted-foreground mt-1">Use this when you are in a rush and don't care if you pay a few cents extra.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4 py-1">
                        <h5 className="font-bold flex items-center gap-2"><Anchor size={16}/> Limit Order (Recommended)</h5>
                        <p className="text-sm">"Buy ONLY if price is $100.00 or less."</p>
                        <p className="text-xs text-muted-foreground mt-1">Use this to control your entry price. The trade might not happen if the stock keeps going up, but you won't overpay.</p>
                    </div>
                </div>
            </div>
        )
      }
    ]
  },
  {
    id: "analysis",
    title: "Module 2: Reading Charts",
    description: "Technical Analysis (TA) basics. Support, Resistance, and Trends.",
    icon: Search,
    color: "bg-teal-500",
    chapters: [
        {
            title: "Candlesticks 101",
            content: (
                <div className="space-y-4">
                    <p>Line charts hide information. Pros use <strong>Candlesticks</strong>.</p>
                    
                    <div className="flex gap-8 items-center justify-center py-6 bg-muted/30 rounded-xl">
                        <div className="text-center group">
                            <div className="w-6 h-20 bg-emerald-500 mx-auto relative rounded-sm shadow-sm group-hover:scale-110 transition-transform">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-emerald-500"></div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-emerald-500"></div>
                            </div>
                            <p className="text-xs font-bold mt-8 text-emerald-600">Green Candle</p>
                            <p className="text-[10px] text-muted-foreground">Price went UP</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-6 h-20 bg-rose-500 mx-auto relative rounded-sm shadow-sm group-hover:scale-110 transition-transform">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-rose-500"></div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-rose-500"></div>
                            </div>
                            <p className="text-xs font-bold mt-8 text-rose-600">Red Candle</p>
                            <p className="text-[10px] text-muted-foreground">Price went DOWN</p>
                        </div>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                        <li><strong>Body:</strong> The thick part. Shows where price opened and closed.</li>
                        <li><strong>Wick (Tail):</strong> The thin line. Shows the extreme High and Low of that time period.</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Support & Resistance",
            content: (
                <div className="space-y-4">
                    <p>Prices don't move randomly. They have memory.</p>
                    <div className="space-y-4">
                         <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10">
                            <h5 className="font-bold text-emerald-700">Support (The Floor)</h5>
                            <p className="text-sm">A price level where the stock struggles to fall below. Buyers step in here because they think it's "cheap".</p>
                         </div>
                         <div className="bg-rose-500/5 p-4 rounded-lg border border-rose-500/10">
                            <h5 className="font-bold text-rose-700">Resistance (The Ceiling)</h5>
                            <p className="text-sm">A price level where the stock struggles to break above. Sellers step in here because they think it's "expensive".</p>
                         </div>
                    </div>
                    <p className="text-sm italic mt-2">"Buy at Support, Sell at Resistance."</p>
                </div>
            )
        }
    ]
  },
  {
    id: "strategies",
    title: "Module 3: Trading Strategies",
    description: "Styles of trading. Pick one that fits your personality.",
    icon: Target,
    color: "bg-purple-500",
    chapters: [
        {
            title: "Day Trading vs Swing Trading",
            content: (
                <div className="space-y-4">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Feature</th>
                                <th className="px-4 py-3">Day Trading</th>
                                <th className="px-4 py-3 rounded-r-lg">Swing Trading</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr>
                                <td className="px-4 py-3 font-medium">Timeframe</td>
                                <td className="px-4 py-3">Minutes / Hours</td>
                                <td className="px-4 py-3">Days / Weeks</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium">Risk</td>
                                <td className="px-4 py-3 text-rose-500 font-bold">Very High</td>
                                <td className="px-4 py-3 text-yellow-600 font-bold">Moderate</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium">Screen Time</td>
                                <td className="px-4 py-3">Full-time job</td>
                                <td className="px-4 py-3">Check once a day</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium">Best For</td>
                                <td className="px-4 py-3">Adrenaline junkies</td>
                                <td className="px-4 py-3"><strong>Beginners</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )
        }
    ]
  },
  {
    id: "risk",
    title: "Module 4: Risk Management",
    description: "How to not lose all your money. The most important module.",
    icon: ShieldCheck,
    color: "bg-orange-500",
    chapters: [
        {
            title: "The 1% Rule",
            content: (
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-orange-600">Survival First</h3>
                    <p><strong>Never risk more than 1% of your total account on a single trade.</strong></p>
                    <div className="bg-muted p-4 rounded-xl">
                        <p className="font-mono text-sm">Example: Account = $10,000</p>
                        <p className="font-mono text-sm">Max Risk = $100</p>
                        <p className="text-sm mt-2 text-muted-foreground">If you buy a stock at $50 and put a stop loss at $49 (risking $1/share), you can buy 100 shares. If you are stopped out, you lose $100 (1%).</p>
                    </div>
                </div>
            )
        }
    ]
  },
  {
      id: "psychology",
      title: "Module 5: Trading Psychology",
      description: "Master your mind. Greed and Fear are your enemies.",
      icon: Brain,
      color: "bg-pink-500",
      chapters: [
          {
              title: "FOMO (Fear Of Missing Out)",
              content: (
                  <div className="space-y-4">
                      <p>You see a stock rocket up 20% in an hour. You feel an itch to buy <em>right now</em> before it goes higher.</p>
                      <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-center">
                          <p className="font-bold text-rose-600 text-lg">STOP! 🛑</p>
                          <p className="text-sm mt-1">This is FOMO. You are buying the top. The professionals are selling to you.</p>
                      </div>
                      <p className="text-sm"><strong>Rule:</strong> Never buy a vertical green line. Wait for a "pullback" (a small drop) to enter safely.</p>
                  </div>
              )
          },
          {
              title: "Revenge Trading",
              content: (
                  <div className="space-y-4">
                      <p>You just lost $200 on a bad trade. You are angry. You immediately make a huge, risky bet to "win it back".</p>
                      <p><strong>This is the fastest way to blow up your account.</strong></p>
                      <p className="text-sm"><strong>Solution:</strong> If you lose 2 trades in a row, walk away. Close the laptop. The market will be there tomorrow.</p>
                  </div>
              )
          }
      ]
  },
  {
    id: "finpredict",
    title: "Module 6: FinPredict AI Manual",
    description: "How to use our specialized tools to gain an edge.",
    icon: Zap,
    color: "bg-indigo-600",
    chapters: [
        {
            title: "Reading the Signals",
            content: (
                <div className="space-y-4">
                    <p>On the Prediction Page, you will see a signal card.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-emerald-500/10 text-emerald-600 p-2 rounded text-center font-bold border border-emerald-500/20">BUY</div>
                        <div className="bg-rose-500/10 text-rose-600 p-2 rounded text-center font-bold border border-rose-500/20">SELL</div>
                        <div className="bg-gray-500/10 text-gray-600 p-2 rounded text-center font-bold border border-gray-500/20">HOLD</div>
                    </div>
                </div>
            )
        },
        {
            title: "Confidence Score %",
            content: (
                <div className="space-y-4">
                    <p>This is the <strong>probability</strong> that the predicted direction is correct.</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-16 font-bold text-emerald-600">80%+</span>
                            <span className="text-sm">High Conviction. Models align with technicals.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-16 font-bold text-yellow-600">60-80%</span>
                            <span className="text-sm">Moderate. Good signal, but verify with news.</span>
                        </div>
                    </div>
                </div>
            )
        }
    ]
  }
];

// Helper to display icon inline (for internal use)
function ActionIcon({ icon: Icon }: { icon: any }) {
    return <Icon size={14} className="inline mx-1 align-baseline" />;
}
