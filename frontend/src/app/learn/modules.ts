// Data-driven learning content — all module data as plain objects for scalability

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChapterData {
  title: string;
  sections: { heading: string; body: string; type?: 'callout' | 'tip' | 'warning' | 'example' | 'comparison' }[];
}

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  chapters: ChapterData[];
  quiz: QuizQuestion[];
}

export interface ConsultantProfile {
  name: string;
  title: string;
  specialization: string;
  experience: string;
  avatar: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  badge: string;
  features: string[];
  highlight: boolean;
  cta: string;
}

export const consultants: ConsultantProfile[] = [
  { name: "Rajesh Kumar", title: "SEBI Registered Advisor", specialization: "Equity & Derivatives", experience: "12+ years", avatar: "RK" },
  { name: "Priya Sharma", title: "Certified Financial Planner", specialization: "Portfolio Management", experience: "8+ years", avatar: "PS" },
  { name: "Amit Desai", title: "Quant Analyst", specialization: "Algorithmic Trading & ML", experience: "10+ years", avatar: "AD" },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Quick Chat",
    price: "₹499",
    period: "per session",
    badge: "Starter",
    features: ["30-minute video call", "Basic portfolio review", "Q&A session", "Summary notes via email"],
    highlight: false,
    cta: "Book a Chat",
  },
  {
    name: "Strategy Session",
    price: "₹1,999",
    period: "per session",
    badge: "Most Popular",
    features: ["60-minute deep-dive", "Custom trading strategy", "Risk assessment report", "7-day follow-up support", "Actionable trade ideas"],
    highlight: true,
    cta: "Get Strategy",
  },
  {
    name: "Mentorship",
    price: "₹4,999",
    period: "per month",
    badge: "Premium",
    features: ["4 sessions per month", "WhatsApp/Telegram support", "Live portfolio tracking", "Weekly market analysis", "Priority access to AI tools", "Personalized learning path"],
    highlight: false,
    cta: "Start Mentorship",
  },
];

export const modules: ModuleData[] = [
  {
    id: "basics",
    title: "The Absolute Basics",
    description: "Start here if you have zero knowledge. We explain stocks using a Lemonade Stand analogy.",
    icon: "Coffee",
    color: "bg-emerald-500",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    chapters: [
      {
        title: "What is a Stock?",
        sections: [
          { heading: "The Lemonade Stand Metaphor 🍋", body: "Imagine you have a great lemonade recipe but need ₹10,000 to start. You only have ₹5,000. You ask your friend Bob for the rest. In exchange, you give him a certificate saying he owns 50% of the business. Congratulations — you just issued stock! The company is the Lemonade Stand, the stock is that certificate, and Bob is the shareholder." },
          { heading: "Why Companies Issue Stock", body: "Companies sell stock to raise money without taking loans. Investors buy stock hoping the company grows and their share becomes more valuable. It's a win-win: the company gets capital, the investor gets potential growth.", type: "tip" },
          { heading: "Real-World Example", body: "When Reliance Industries went public, Dhirubhai Ambani sold shares to everyday Indians. Those early ₹10 shares are now worth lakhs. That's the power of equity ownership.", type: "example" },
        ]
      },
      {
        title: "Stock Exchanges: NSE & BSE",
        sections: [
          { heading: "What is a Stock Exchange?", body: "A stock exchange is like a supermarket for stocks. Instead of vegetables, you buy and sell ownership in companies. India has two major exchanges: NSE (National Stock Exchange) and BSE (Bombay Stock Exchange, Asia's oldest from 1875)." },
          { heading: "NSE vs BSE", body: "NSE is the most actively traded exchange with the NIFTY 50 index. BSE is older and uses the SENSEX (30 stocks). Most traders use NSE for its superior technology and liquidity. Both are regulated by SEBI (Securities and Exchange Board of India).", type: "comparison" },
          { heading: "Trading Hours", body: "Indian markets operate Monday–Friday, 9:15 AM – 3:30 PM IST. Pre-market session runs from 9:00–9:15 AM where orders are matched. No trading on weekends and designated market holidays.", type: "tip" },
        ]
      },
      {
        title: "Demat & Trading Accounts",
        sections: [
          { heading: "What You Need to Start", body: "To buy stocks in India, you need three things: a Bank Account (for money), a Trading Account (to place buy/sell orders), and a Demat Account (to hold your stocks electronically). Most brokers like Zerodha, Groww, or Angel One provide trading + demat together." },
          { heading: "How to Choose a Broker", body: "Look for: low brokerage fees (Zerodha charges ₹20/trade or 0.03%), a good app/platform, research tools, and SEBI registration. Avoid brokers promising guaranteed returns — that's illegal.", type: "warning" },
          { heading: "Your First Trade", body: "Open Zerodha/Groww → Complete KYC (Aadhaar + PAN) → Transfer funds → Search for a stock (e.g., 'TCS') → Click Buy → Choose quantity → Select Market or Limit order → Confirm. You now own a piece of India's largest IT company!", type: "example" },
        ]
      },
      {
        title: "Going Public: The IPO",
        sections: [
          { heading: "What is an IPO?", body: "An IPO (Initial Public Offering) is the first time a company sells its shares to the public. Before an IPO, the company is 'private' — only founders and early investors own it. After the IPO, anyone can buy shares on the stock exchange." },
          { heading: "How IPOs Work in India", body: "The company files a DRHP (Draft Red Herring Prospectus) with SEBI → SEBI reviews it → Company sets a price band (e.g., ₹350–₹370 per share) → You apply through your broker → Shares are allotted via lottery if oversubscribed → Stock lists on NSE/BSE on the listing date.", type: "example" },
          { heading: "Should You Invest in IPOs?", body: "Not all IPOs are good. Many list below issue price. Research the company's financials, look at the Grey Market Premium (GMP), and never invest money you can't afford to lose. IPOs are speculative — treat them as such.", type: "warning" },
        ]
      },
      {
        title: "Why Do Stock Prices Move?",
        sections: [
          { heading: "Supply & Demand", body: "If more people want to buy a stock (demand) than sell it (supply), the price goes up. If more want to sell than buy, it drops. It's that simple at its core." },
          { heading: "What Drives Demand?", body: "Good earnings reports, new product launches, government policies (like tax cuts), global market trends, institutional buying (FII/DII), and positive news all increase demand. Bad news, scandals, poor earnings, or global crises reduce demand." },
          { heading: "The Auction Analogy", body: "Think of it like an auction. Multiple buyers bid on a limited item. The highest bidder wins. On the stock market, millions of these auctions happen every second. The latest winning bid becomes the 'price' you see on screen.", type: "example" },
          { heading: "Key Takeaway", body: "The stock market is just millions of people arguing about what a company is worth RIGHT NOW. Prices reflect collective human emotion as much as fundamentals.", type: "callout" },
        ]
      },
    ],
    quiz: [
      { question: "What does owning a stock represent?", options: ["A loan to the company", "Ownership in the company", "A fixed deposit", "A government bond"], correctIndex: 1, explanation: "Stock represents partial ownership (equity) in a company. Unlike a loan, you share in profits and losses." },
      { question: "Which is the most actively traded stock exchange in India?", options: ["BSE", "NSE", "MCX", "NCDEX"], correctIndex: 1, explanation: "NSE handles over 90% of India's equity trading volume, making it the most liquid exchange." },
      { question: "What do you need to buy stocks in India?", options: ["Only a bank account", "A demat + trading account", "A cryptocurrency wallet", "A passport"], correctIndex: 1, explanation: "You need a demat account (to hold shares) and a trading account (to place orders), both linked to your bank account." },
      { question: "If more people want to buy a stock than sell it, the price:", options: ["Stays the same", "Goes down", "Goes up", "Gets delisted"], correctIndex: 2, explanation: "Higher demand with limited supply pushes the price upward — basic economics." },
    ]
  },
  {
    id: "mechanics",
    title: "Market Mechanics",
    description: "How to actually buy. Bids, Asks, Order Types, and Settlement explained.",
    icon: "Globe",
    color: "bg-blue-500",
    difficulty: "Beginner",
    estimatedTime: "1 hour",
    chapters: [
      {
        title: "The Bid-Ask Spread",
        sections: [
          { heading: "Two Prices for Every Stock", body: "When you look at a stock, you see two prices. The Bid (₹100.00) is the highest price a buyer will pay. The Ask (₹100.05) is the lowest price a seller will accept. The difference (₹0.05) is the Spread." },
          { heading: "Why the Spread Matters", body: "The spread is a hidden cost. If you buy at ₹100.05 (Ask) and immediately sell, you'd get ₹100.00 (Bid) — losing ₹0.05 per share. Highly liquid stocks like Reliance have tiny spreads (1-2 paise). Illiquid penny stocks can have massive spreads.", type: "warning" },
          { heading: "How 'Free' Brokers Make Money", body: "Discount brokers earn through the spread via Payment for Order Flow (PFOF) and by earning interest on your idle cash. Nothing in finance is truly free.", type: "tip" },
        ]
      },
      {
        title: "Order Types: Market, Limit & Stop-Loss",
        sections: [
          { heading: "Market Order ⚡", body: "\"Buy NOW at whatever price is available.\" Fast execution but you might pay slightly more than expected, especially in volatile markets. Use when speed matters more than price." },
          { heading: "Limit Order 🎯 (Recommended)", body: "\"Buy ONLY if the price is ₹100 or less.\" You control the price. The trade might not execute if the stock keeps rising, but you won't overpay. Always use limit orders as a beginner.", type: "tip" },
          { heading: "Stop-Loss Order 🛡️", body: "\"If the price drops to ₹95, sell automatically.\" This protects you from big losses. Example: You buy TCS at ₹100, set stop-loss at ₹95. If TCS drops to ₹95, your shares are sold automatically, limiting your loss to ₹5/share.", type: "example" },
          { heading: "Bracket Order & Cover Order", body: "Advanced order types that combine entry + stop-loss + target in one order. Bracket: Buy at ₹100, stop-loss ₹95, target ₹110 — all set at once. Available on platforms like Zerodha Kite." },
        ]
      },
      {
        title: "Settlement Cycle: T+1",
        sections: [
          { heading: "When Do You Actually Own the Stock?", body: "India moved to T+1 settlement in 2023, meaning shares are credited to your demat account 1 business day after purchase. If you buy on Monday, shares arrive Tuesday." },
          { heading: "BTST (Buy Today, Sell Tomorrow)", body: "You can sell shares the next day even before settlement completes. But if settlement fails (rare), you may face auction penalties. BTST is common but carries a small risk.", type: "warning" },
        ]
      },
      {
        title: "Circuit Breakers & Market Halts",
        sections: [
          { heading: "What Are Circuit Breakers?", body: "SEBI mandates automatic trading halts when markets move too sharply. If NIFTY drops 10% → trading halts for 45 mins. If it drops 15% → halt for 1hr 45 mins. If it drops 20% → market closes for the day. This prevents panic selling." },
          { heading: "Stock-Level Circuits", body: "Individual stocks also have daily circuit limits (2%, 5%, 10%, or 20% depending on the stock). If a stock hits its upper circuit, you can't buy (no sellers). If it hits lower circuit, you can't sell (no buyers). Penny stocks frequently hit circuits.", type: "warning" },
        ]
      },
      {
        title: "Market Indices: NIFTY 50 & SENSEX",
        sections: [
          { heading: "What is an Index?", body: "An index is a basket of stocks that represents the overall market. NIFTY 50 = top 50 companies on NSE. SENSEX = top 30 companies on BSE. When people say 'the market went up', they usually mean NIFTY or SENSEX went up." },
          { heading: "How Indices Are Calculated", body: "Indices use free-float market capitalization weighting. Larger companies (like Reliance, TCS, HDFC Bank) have more influence on the index movement than smaller companies.", type: "tip" },
          { heading: "Sectoral Indices", body: "NIFTY Bank (banking stocks), NIFTY IT (tech stocks), NIFTY Pharma, NIFTY Auto — these track specific sectors and help you understand which sectors are performing well.", type: "example" },
        ]
      },
    ],
    quiz: [
      { question: "The difference between Bid and Ask price is called:", options: ["Commission", "Spread", "Dividend", "Premium"], correctIndex: 1, explanation: "The spread is the gap between what buyers offer (bid) and sellers want (ask). It's a transaction cost." },
      { question: "Which order type gives you control over the buy price?", options: ["Market Order", "Limit Order", "Good Till Cancelled", "After Market Order"], correctIndex: 1, explanation: "A limit order executes only at your specified price or better, giving you price control." },
      { question: "What happens when NIFTY drops 20% in a day?", options: ["Nothing", "Trading halts for 45 mins", "Market closes for the day", "Only F&O stops"], correctIndex: 2, explanation: "A 20% drop triggers a Level 3 circuit breaker, halting trading for the rest of the day." },
    ]
  },
  {
    id: "charts",
    title: "Reading Charts & Technical Analysis",
    description: "Candlesticks, Support/Resistance, Moving Averages, and Chart Patterns decoded.",
    icon: "BarChart2",
    color: "bg-teal-500",
    difficulty: "Beginner",
    estimatedTime: "1.5 hours",
    chapters: [
      {
        title: "Candlesticks 101",
        sections: [
          { heading: "Why Candlesticks?", body: "Line charts only show closing prices. Candlesticks show FOUR data points: Open, High, Low, Close (OHLC). Each candle tells a story about the battle between buyers and sellers during that time period." },
          { heading: "Anatomy of a Candle", body: "Body (thick part): Range between Open and Close. If Close > Open → Green/Bullish candle. If Close < Open → Red/Bearish candle. Wick/Shadow (thin lines): The High and Low extremes. A long upper wick means sellers pushed the price back down." },
          { heading: "Common Single-Candle Patterns", body: "Doji: Open = Close (indecision). Hammer: Small body at top, long lower wick (bullish reversal). Shooting Star: Small body at bottom, long upper wick (bearish reversal). Marubozu: Full body, no wicks (strong conviction in that direction).", type: "example" },
        ]
      },
      {
        title: "Support & Resistance",
        sections: [
          { heading: "Support — The Floor", body: "A price level where the stock repeatedly bounces upward. Buyers step in here because they consider it 'cheap'. Example: If TCS bounces off ₹3,500 three times, ₹3,500 is a strong support level." },
          { heading: "Resistance — The Ceiling", body: "A price level where the stock struggles to break above. Sellers take profits here because they consider it 'expensive'. When resistance finally breaks, it often becomes the new support." },
          { heading: "The Golden Rule", body: "Buy near support, sell near resistance. If a stock breaks through resistance with high volume, it's called a Breakout — and often leads to a strong upward move.", type: "callout" },
        ]
      },
      {
        title: "Moving Averages (SMA & EMA)",
        sections: [
          { heading: "Simple Moving Average (SMA)", body: "The average closing price over a period. SMA-20 = average of last 20 days' closing prices. It smooths out noise and shows the overall trend. Price above SMA → uptrend. Price below SMA → downtrend." },
          { heading: "Exponential Moving Average (EMA)", body: "Like SMA but gives more weight to recent prices, making it more responsive. EMA-9 and EMA-21 are popular for short-term trading. EMA reacts faster to price changes than SMA.", type: "tip" },
          { heading: "Golden Cross & Death Cross", body: "When the 50-day SMA crosses ABOVE the 200-day SMA → Golden Cross (bullish signal). When 50-day crosses BELOW 200-day → Death Cross (bearish signal). These are widely watched by institutional traders.", type: "example" },
        ]
      },
      {
        title: "Key Indicators: RSI & MACD",
        sections: [
          { heading: "RSI (Relative Strength Index)", body: "Measures momentum on a scale of 0–100. RSI > 70 → Overbought (stock may drop). RSI < 30 → Oversold (stock may bounce). RSI between 40–60 is neutral. Use RSI to confirm, not as a sole signal." },
          { heading: "MACD (Moving Average Convergence Divergence)", body: "Shows the relationship between two EMAs (usually 12 and 26). MACD Line crosses above Signal Line → Buy signal. MACD Line crosses below Signal Line → Sell signal. The histogram shows the strength of the signal." },
          { heading: "Don't Stack Too Many Indicators", body: "Using 5+ indicators creates analysis paralysis. Pick 2-3 that you understand well. Most professional traders use: Price Action + Volume + one oscillator (RSI or MACD).", type: "warning" },
        ]
      },
      {
        title: "Chart Patterns",
        sections: [
          { heading: "Head & Shoulders", body: "A reversal pattern with three peaks: left shoulder, head (highest), right shoulder. When the 'neckline' connecting the lows breaks, it signals a bearish reversal. Inverse H&S signals bullish reversal." },
          { heading: "Double Top & Double Bottom", body: "Double Top: Price hits resistance twice and fails → bearish. Double Bottom: Price hits support twice and bounces → bullish. These are among the most reliable reversal patterns." },
          { heading: "Flags & Triangles", body: "Continuation patterns. After a sharp move, the price consolidates in a small channel (flag) or narrowing range (triangle), then continues in the original direction. Look for volume expansion on the breakout.", type: "example" },
          { heading: "Volume Confirms Everything", body: "A breakout without volume is a fake breakout. Always check if volume is above average when a pattern completes. Volume is the 'fuel' behind price movements.", type: "callout" },
        ]
      },
    ],
    quiz: [
      { question: "A green candlestick means:", options: ["The stock went down", "Close > Open (price went up)", "High volume day", "Market was closed"], correctIndex: 1, explanation: "A green/bullish candle means the closing price was higher than the opening price for that period." },
      { question: "RSI above 70 indicates:", options: ["Oversold", "Neutral", "Overbought", "No signal"], correctIndex: 2, explanation: "RSI > 70 suggests the stock may be overbought and could be due for a pullback." },
      { question: "A 'Golden Cross' occurs when:", options: ["RSI crosses 50", "50-day SMA crosses above 200-day SMA", "Stock hits all-time high", "Volume spikes"], correctIndex: 1, explanation: "The Golden Cross is a bullish signal when the short-term MA crosses above the long-term MA." },
    ]
  },
  {
    id: "strategies",
    title: "Trading & Investment Strategies",
    description: "Day trading, Swing trading, Value investing, SIP — pick what suits your personality.",
    icon: "Target",
    color: "bg-purple-500",
    difficulty: "Intermediate",
    estimatedTime: "1.5 hours",
    chapters: [
      {
        title: "Trading Styles Compared",
        sections: [
          { heading: "Day Trading", body: "Buy and sell within the same day. Requires full-time attention, fast internet, and strong emotional control. Timeframe: minutes to hours. Risk: Very High. Best for: Experienced traders only.", type: "comparison" },
          { heading: "Swing Trading (Recommended for Beginners)", body: "Hold positions for days to weeks, capturing 'swings' in price. Less screen time, uses daily charts. You can keep your day job. Risk: Moderate. Best for: People who can check charts once a day.", type: "tip" },
          { heading: "Positional/Long-Term Investing", body: "Buy and hold for months to years. Focus on company fundamentals, not daily price movements. Warren Buffett's approach. Risk: Lower. Best for: Building wealth over time." },
          { heading: "SIP (Systematic Investment Plan)", body: "Invest a fixed amount monthly into stocks or mutual funds. Removes the stress of timing the market. Rupee-cost averaging smooths out volatility. Even ₹500/month in NIFTY index fund for 20 years can build significant wealth.", type: "example" },
        ]
      },
      {
        title: "Value Investing Basics",
        sections: [
          { heading: "The Core Idea", body: "Find companies trading below their intrinsic value. Like buying a ₹100 item for ₹60. Look at PE ratio (Price/Earnings), PB ratio (Price/Book), debt levels, and consistent profit growth." },
          { heading: "Key Metrics to Check", body: "PE Ratio < 20 (generally undervalued). Debt-to-Equity < 1 (low debt). ROE > 15% (efficient use of capital). Consistent revenue growth for 5+ years. Promoter holding > 50% (skin in the game).", type: "tip" },
        ]
      },
      {
        title: "Momentum & Breakout Trading",
        sections: [
          { heading: "Momentum Strategy", body: "Buy stocks already going up, ride the wave, sell before it reverses. Uses indicators like RSI trending above 50, price above 20-EMA, and increasing volume. Follow the trend, don't fight it." },
          { heading: "Breakout Strategy", body: "Wait for a stock to break above resistance with high volume, then buy. Set stop-loss just below the broken resistance (now support). Target: distance equal to the previous consolidation range.", type: "example" },
        ]
      },
      {
        title: "Paper Trading: Practice Without Risk",
        sections: [
          { heading: "What is Paper Trading?", body: "Trading with virtual money to practice strategies without financial risk. Most brokers offer demo accounts. Spend at least 3 months paper trading before using real money." },
          { heading: "How to Paper Trade Effectively", body: "Treat it like real money. Keep a trading journal. Record every trade: entry, exit, reason, result. Review weekly. Only go live when you're consistently profitable for 3+ months.", type: "callout" },
        ]
      },
    ],
    quiz: [
      { question: "Which trading style requires the least screen time?", options: ["Day Trading", "Scalping", "Swing Trading", "High-Frequency Trading"], correctIndex: 2, explanation: "Swing trading uses daily charts and only requires checking the market once or twice a day." },
      { question: "SIP stands for:", options: ["Stock Investment Portfolio", "Systematic Investment Plan", "Short-term Investment Program", "Secure Index Planning"], correctIndex: 1, explanation: "SIP is a method of investing fixed amounts at regular intervals, commonly in mutual funds." },
    ]
  },
  {
    id: "risk",
    title: "Risk Management",
    description: "How to not lose all your money. The most critical module for every trader.",
    icon: "ShieldCheck",
    color: "bg-orange-500",
    difficulty: "Beginner",
    estimatedTime: "1 hour",
    chapters: [
      {
        title: "The 1% Rule",
        sections: [
          { heading: "Survival First 🛡️", body: "Never risk more than 1-2% of your total capital on a single trade. Account = ₹1,00,000 → Max risk per trade = ₹1,000-2,000. This means if your stop-loss is ₹10 away from entry, you buy max 100-200 shares." },
          { heading: "Why This Works", body: "Even if you lose 10 trades in a row (unlikely with a good strategy), you still have 90% of your capital left. Recovery is possible. But if you risk 20% per trade and lose 3 in a row, you've lost 60% — and need a 150% gain just to break even.", type: "warning" },
        ]
      },
      {
        title: "Position Sizing",
        sections: [
          { heading: "The Formula", body: "Position Size = (Account Risk) ÷ (Trade Risk per share). If Account = ₹1,00,000. Risk = 1% = ₹1,000. Stop-loss = ₹5 below entry. Position Size = ₹1,000 ÷ ₹5 = 200 shares maximum." },
          { heading: "Never Skip This Step", body: "Calculate position size BEFORE every trade. It should be automatic, like buckling your seatbelt. No exceptions, no 'this time feels different'.", type: "callout" },
        ]
      },
      {
        title: "Stop-Loss Strategies",
        sections: [
          { heading: "Fixed Stop-Loss", body: "Set at a fixed percentage (e.g., 3% below entry). Simple but doesn't account for stock volatility. Use for beginners." },
          { heading: "Technical Stop-Loss (Better)", body: "Place stop-loss below a support level, moving average, or swing low. This uses the chart's structure. If support breaks, your thesis is wrong — the stop-loss exits you automatically.", type: "tip" },
          { heading: "Trailing Stop-Loss", body: "As the stock moves in your favor, your stop-loss moves up with it, locking in profits. Example: Buy at ₹100, set 5% trailing. Price goes to ₹120 → stop moves to ₹114. Price drops to ₹114 → you're out with ₹14 profit/share.", type: "example" },
        ]
      },
      {
        title: "Risk-Reward Ratio",
        sections: [
          { heading: "The 1:2 Minimum", body: "Only take trades where potential reward is at least 2x the risk. Risk ₹5 per share → Target should be ₹10+ per share. This means even if you're right only 50% of the time, you're still profitable." },
          { heading: "How to Calculate", body: "Reward = Target Price − Entry Price. Risk = Entry Price − Stop-Loss Price. RR Ratio = Reward ÷ Risk. If Reward = ₹15, Risk = ₹5 → RR = 3:1 (excellent trade).", type: "example" },
        ]
      },
      {
        title: "Diversification",
        sections: [
          { heading: "Don't Put All Eggs in One Basket", body: "Spread investments across: different stocks (5-15 stocks), different sectors (IT, Banking, Pharma, FMCG), different asset classes (equity, debt, gold), and different geographies (India + US markets)." },
          { heading: "Over-Diversification Warning", body: "Holding 50+ stocks is not diversification — it's a mutual fund without the expertise. Stick to 8-15 well-researched stocks. Know each one deeply. Quality over quantity.", type: "warning" },
        ]
      },
    ],
    quiz: [
      { question: "With the 1% rule and ₹50,000 capital, your max risk per trade is:", options: ["₹5,000", "₹500", "₹1,000", "₹50"], correctIndex: 1, explanation: "1% of ₹50,000 = ₹500. This is the maximum you should be prepared to lose on any single trade." },
      { question: "A Risk-Reward ratio of 1:3 means:", options: ["You risk 3x to gain 1x", "You risk 1x to potentially gain 3x", "33% win rate", "3 trades per day"], correctIndex: 1, explanation: "1:3 means for every ₹1 you risk, you aim to make ₹3 in profit." },
    ]
  },
  {
    id: "psychology",
    title: "Trading Psychology",
    description: "Master your mind. Greed and Fear are your biggest enemies — bigger than any bear market.",
    icon: "Brain",
    color: "bg-pink-500",
    difficulty: "Intermediate",
    estimatedTime: "1 hour",
    chapters: [
      {
        title: "FOMO — Fear Of Missing Out",
        sections: [
          { heading: "The Trap 🚨", body: "A stock rockets 20% in an hour. Social media is exploding. You feel an irresistible itch to buy RIGHT NOW before it goes higher. This is FOMO, and it's how retail traders consistently buy at the top." },
          { heading: "The Reality", body: "When you see a vertical green line, the smart money (institutions) is SELLING to you. You are the exit liquidity. The stock will likely pull back 5-10% soon.", type: "warning" },
          { heading: "The Fix", body: "Rule: Never buy a vertical green candle. Wait for a 'pullback' (a small dip) to enter at a better price. If you miss the move, there will always be another opportunity. The market is open 250+ days a year.", type: "tip" },
        ]
      },
      {
        title: "Revenge Trading",
        sections: [
          { heading: "What It Looks Like", body: "You just lost ₹5,000 on a bad trade. You're angry. You immediately take a huge, aggressive trade to 'win it back'. This is revenge trading — the fastest way to blow up your account." },
          { heading: "The Rule", body: "If you lose 2 trades in a row, STOP trading for the day. Close the laptop. Go for a walk. The market will be there tomorrow. Your capital won't be if you keep revenge trading.", type: "callout" },
        ]
      },
      {
        title: "Confirmation Bias",
        sections: [
          { heading: "Seeing What You Want to See", body: "After buying a stock, you start ignoring negative news and actively seeking positive opinions that confirm your decision. You follow only bullish analysts and block bearish ones." },
          { heading: "The Antidote", body: "Before every trade, actively search for reasons NOT to take it. Read the bear case. If the trade still makes sense after hearing the opposite argument, it's probably a good trade.", type: "tip" },
        ]
      },
      {
        title: "The Sunk Cost Fallacy",
        sections: [
          { heading: "Holding Losers Too Long", body: "\"I've already lost ₹10,000 on this stock, I can't sell now — that would make it a real loss.\" This thinking is a trap. The stock doesn't know or care you're holding it. If the thesis is broken, sell and move on." },
          { heading: "The Reframe", body: "Ask yourself: 'If I had cash instead, would I buy this stock at TODAY's price?' If the answer is no, you should sell. The money is already lost — the question is whether to lose more.", type: "callout" },
        ]
      },
      {
        title: "Building a Trading Journal",
        sections: [
          { heading: "Why Keep a Journal?", body: "Without a journal, you're gambling. With a journal, you're running a business. Track every trade with: Date, Stock, Entry/Exit price, Position size, Reason for entry, Reason for exit, P&L, Emotional state, Screenshot of chart." },
          { heading: "Weekly Review", body: "Every Sunday, review your journal. Find patterns: Do you lose more on Mondays? Do you over-trade after a win? Are your stop-losses too tight? Data turns feelings into facts.", type: "tip" },
          { heading: "The Zen Trader Mindset", body: "Trading is not about being right — it's about managing probabilities. Accept losses as the cost of doing business. Focus on process, not outcome. A good trader follows their system even when it feels wrong.", type: "callout" },
        ]
      },
    ],
    quiz: [
      { question: "What should you do after losing 2 trades in a row?", options: ["Double down to recover", "Stop trading for the day", "Switch to a different stock", "Remove stop-losses"], correctIndex: 1, explanation: "After consecutive losses, emotions take over. The best action is to step away and return with a clear mind." },
      { question: "Confirmation bias in trading means:", options: ["Confirming your order was placed", "Only seeking info that agrees with your position", "Double-checking your analysis", "Getting a second opinion"], correctIndex: 1, explanation: "Confirmation bias is the tendency to search for information that supports your existing beliefs while ignoring contradictory evidence." },
    ]
  },
  {
    id: "finpredict",
    title: "FinPredict AI Manual",
    description: "Master our AI-powered tools. Learn to combine machine learning signals with your own analysis.",
    icon: "Zap",
    color: "bg-indigo-600",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    chapters: [
      {
        title: "Reading AI Signals",
        sections: [
          { heading: "The Signal Card", body: "On the Predictions page, every stock shows a signal: BUY (green), SELL (red), or HOLD (neutral). This signal is generated by our LSTM deep learning model trained on historical OHLCV data, technical indicators, and market patterns." },
          { heading: "What the Signal Means", body: "BUY: The model predicts the stock will go UP in the forecast period. SELL: The model predicts a decline. HOLD: Low conviction — model sees no clear direction. Never blindly follow any signal — AI or human.", type: "tip" },
        ]
      },
      {
        title: "Understanding Confidence Scores",
        sections: [
          { heading: "What is the Confidence %?", body: "The probability that the predicted direction is correct. 80%+ = High conviction, models and technicals align. 60-80% = Moderate, good signal but verify with news and your own analysis. Below 60% = Low conviction, best to avoid." },
          { heading: "Confidence ≠ Guaranteed Profit", body: "A 90% confidence BUY signal doesn't mean you'll make 90% profit. It means historical patterns suggest 9 out of 10 similar setups moved in the predicted direction. The current trade could be the 1 exception.", type: "warning" },
        ]
      },
      {
        title: "Using the Watchlist",
        sections: [
          { heading: "Smart Tracking", body: "Add stocks you're interested in to your Watchlist. Monitor their AI signals, price movements, and confidence scores over time. Don't trade — just watch for 1-2 weeks to build conviction." },
          { heading: "Setting Up Your Watchlist", body: "Start with 5-10 stocks from different sectors: 2-3 large caps (Reliance, TCS, HDFC), 2-3 mid caps, and 2-3 stocks you personally use/understand. Track how the AI signals perform before committing real money.", type: "tip" },
        ]
      },
      {
        title: "Portfolio Tracking",
        sections: [
          { heading: "Real-Time Dashboard", body: "The Portfolio page shows your holdings, their current value, P&L, and day change. Use it to monitor your overall portfolio health and identify underperformers." },
          { heading: "Combining AI + Your Analysis", body: "Best approach: Use FinPredict AI signals as ONE input, not THE input. Step 1: Check AI signal. Step 2: Look at the chart (support/resistance). Step 3: Check recent news. Step 4: If 2 of 3 agree, consider taking the trade.", type: "callout" },
        ]
      },
      {
        title: "Understanding Model Accuracy",
        sections: [
          { heading: "How Our Models Work", body: "We use LSTM (Long Short-Term Memory) neural networks trained on years of OHLCV data. The model learns patterns in price movements, volume spikes, and technical indicator combinations to forecast future direction." },
          { heading: "Accuracy Expectations", body: "No model is 100% accurate. Typical accuracy ranges from 55-75% depending on market conditions. In trending markets, accuracy is higher. In choppy, sideways markets, accuracy drops. This is normal.", type: "tip" },
          { heading: "When to Trust AI Less", body: "During major events (budget announcements, elections, global crises), markets behave atypically. AI models trained on historical data struggle with unprecedented events. Reduce position sizes during such periods.", type: "warning" },
        ]
      },
    ],
    quiz: [
      { question: "What does a 75% confidence score mean?", options: ["Stock will rise 75%", "75% chance direction is correct", "Model is 75% trained", "75% of traders agree"], correctIndex: 1, explanation: "The confidence score represents the probability that the AI's predicted direction (up/down) is correct based on historical patterns." },
      { question: "The best way to use AI signals is to:", options: ["Follow every signal blindly", "Combine with chart analysis and news", "Only trade 90%+ confidence", "Ignore low-confidence signals entirely"], correctIndex: 1, explanation: "AI signals are most effective when combined with technical analysis and fundamental news for a multi-factor decision." },
    ]
  },
  {
    id: "indian-market",
    title: "Indian Market Essentials",
    description: "NSE/BSE specifics, SEBI regulations, taxes, F&O basics — everything India-specific.",
    icon: "Flag",
    color: "bg-amber-500",
    difficulty: "Beginner",
    estimatedTime: "1.5 hours",
    chapters: [
      {
        title: "SEBI & Market Regulation",
        sections: [
          { heading: "What is SEBI?", body: "The Securities and Exchange Board of India is the market regulator. Established in 1992 after the Harshad Mehta scam. SEBI's job: protect investors, maintain fair markets, and prevent fraud. Always check if your broker is SEBI-registered before opening an account." },
          { heading: "Key SEBI Rules for Retail Investors", body: "Minimum margin requirements for F&O. Peak margin reporting. No guaranteed returns — any 'advisor' promising fixed returns is illegal. Insider trading is a criminal offense.", type: "warning" },
        ]
      },
      {
        title: "Taxes on Stock Market Income",
        sections: [
          { heading: "Short-Term Capital Gains (STCG)", body: "If you sell shares within 12 months of buying → taxed at 15%. This applies to delivery trades only. Example: Buy 100 shares at ₹100, sell at ₹150 within 12 months → Profit = ₹5,000 → Tax = ₹750." },
          { heading: "Long-Term Capital Gains (LTCG)", body: "If you sell shares after 12+ months → gains above ₹1 lakh/year are taxed at 10%. First ₹1 lakh is tax-free. This encourages long-term investing.", type: "tip" },
          { heading: "Intraday & F&O Tax", body: "Intraday profits are treated as business income — taxed at your slab rate (could be 30%!). F&O profits are also business income. You can offset F&O losses against other business income. Keep detailed records.", type: "example" },
          { heading: "STT (Securities Transaction Tax)", body: "0.1% on delivery buy/sell. 0.025% on intraday sell side only. This small tax adds up over hundreds of trades. Factor it into your profitability calculations.", type: "tip" },
        ]
      },
      {
        title: "Futures & Options (F&O) Explained Simply",
        sections: [
          { heading: "What are Derivatives?", body: "Contracts whose value is 'derived' from an underlying asset (stock, index). Two types: Futures (obligation to buy/sell at a future date) and Options (right, not obligation, to buy/sell)." },
          { heading: "Why F&O is Dangerous for Beginners", body: "F&O uses leverage — you control large positions with small margins. 1 lot of NIFTY futures = ~₹10 lakh exposure with only ₹1 lakh margin. A 5% move against you = 50% loss on margin. SEBI data shows 89% of F&O traders lose money.", type: "warning" },
          { heading: "When to Consider F&O", body: "Only after 1+ years of profitable equity trading. Only with money you can afford to lose completely. Start with options buying (limited loss) before options selling (unlimited loss potential). Take a proper course first.", type: "callout" },
        ]
      },
      {
        title: "Mutual Funds vs Direct Equity",
        sections: [
          { heading: "Mutual Funds", body: "Pool of money managed by professional fund managers. Types: Large Cap (safe), Mid Cap (moderate), Small Cap (risky), Index Funds (mirrors NIFTY/SENSEX). Expense ratio: 0.5-2% annually. Best for: beginners and passive investors." },
          { heading: "Direct Equity", body: "You pick and buy individual stocks yourself. Higher potential returns but also higher risk. Requires knowledge, time, and emotional discipline. Best for: educated investors willing to put in the work.", type: "comparison" },
          { heading: "The Smart Combo", body: "SIP into index funds (60% of portfolio) + Direct stocks you understand (40%). This gives you stability from the index fund and upside potential from your stock picks.", type: "tip" },
        ]
      },
      {
        title: "Best Practices for Indian Retail Investors",
        sections: [
          { heading: "Start Small", body: "Begin with ₹5,000-10,000. Learn with money you can afford to lose. Scale up only after 6 months of consistent profits. Your first year is tuition — expect to pay it." },
          { heading: "10 Golden Rules", body: "1. Never invest borrowed money. 2. Don't follow tips from WhatsApp groups. 3. File your taxes honestly. 4. Diversify across 8-15 stocks. 5. Use stop-losses always. 6. Keep 6 months of expenses in an emergency fund first. 7. Never risk more than 1% per trade. 8. Stay away from penny stocks. 9. Keep learning. 10. The market is always right — you are the one who's wrong.", type: "callout" },
        ]
      },
    ],
    quiz: [
      { question: "STCG tax rate for stocks sold within 12 months is:", options: ["10%", "15%", "20%", "30%"], correctIndex: 1, explanation: "Short-term capital gains on equity shares sold within 12 months are taxed at a flat rate of 15%." },
      { question: "According to SEBI data, what percentage of F&O traders lose money?", options: ["50%", "70%", "89%", "95%"], correctIndex: 2, explanation: "SEBI's 2023 study revealed that approximately 89% of individual F&O traders incurred losses." },
      { question: "LTCG tax kicks in above ₹____ per year:", options: ["₹50,000", "₹1,00,000", "₹2,50,000", "No threshold"], correctIndex: 1, explanation: "Long-term capital gains on equity are tax-free up to ₹1 lakh per financial year. Above that, taxed at 10%." },
    ]
  },
  {
    id: "portfolio",
    title: "Building Your First Portfolio",
    description: "Asset allocation, goal-based investing, and creating a portfolio that lets you sleep at night.",
    icon: "PieChart",
    color: "bg-cyan-600",
    difficulty: "Beginner",
    estimatedTime: "1 hour",
    chapters: [
      {
        title: "Asset Allocation Basics",
        sections: [
          { heading: "What is Asset Allocation?", body: "Dividing your investment money across different asset classes: Equity (stocks), Debt (bonds, FDs), Gold, and Real Estate. The split depends on your age, risk tolerance, and financial goals." },
          { heading: "The Rule of 100", body: "Equity allocation = 100 − your age. If you're 22 → 78% in equity, 22% in debt/gold. This is a rough guide. Aggressive investors can go higher in equity. Conservative investors lower. Adjust based on your risk tolerance.", type: "tip" },
          { heading: "Sample Allocation for a 22-Year-Old", body: "Equity: 70% (40% NIFTY index fund + 30% direct stocks). Debt: 15% (PPF + Short-term debt mutual fund). Gold: 10% (Sovereign Gold Bonds). Emergency Fund: 5% (Liquid mutual fund).", type: "example" },
        ]
      },
      {
        title: "Goal-Based Investing",
        sections: [
          { heading: "Define Your Goals", body: "Without a clear goal, investing is just gambling with a delay. Set specific goals: Emergency fund (6 months expenses) in 6 months. Laptop fund (₹80,000) in 1 year. Car down payment (₹3 lakh) in 3 years. Retirement corpus (₹5 crore) in 30 years." },
          { heading: "Match Goals to Instruments", body: "Short-term (< 1 year): Liquid funds, Savings account. Medium-term (1-5 years): Debt mutual funds, balanced funds. Long-term (5+ years): Equity mutual funds, direct stocks, NIFTY 50 index fund.", type: "tip" },
        ]
      },
      {
        title: "Building a Core-Satellite Portfolio",
        sections: [
          { heading: "Core (70-80%)", body: "Your stable foundation. NIFTY 50 index fund via SIP. This gives you exposure to India's 50 best companies with minimal effort. Historically, NIFTY has returned ~12% CAGR over 20 years." },
          { heading: "Satellite (20-30%)", body: "Your high-conviction picks. 5-8 individual stocks from sectors you understand. Use your FinPredict AI signals + personal analysis. This is where you try to beat the market.", type: "tip" },
          { heading: "Rebalance Annually", body: "Once a year, check if your allocation has drifted. If a stock has grown to be 25% of your portfolio, trim it. If equity has dropped due to market crash, buy more (buy the dip). Stay disciplined.", type: "callout" },
        ]
      },
      {
        title: "Common Mistakes to Avoid",
        sections: [
          { heading: "Mistake 1: Starting Without an Emergency Fund", body: "Before investing a single rupee, save 6 months of expenses in a liquid fund. If you lose your job or have a medical emergency, you won't be forced to sell investments at a loss." },
          { heading: "Mistake 2: Chasing Hot Tips", body: "Your neighbor made 50% on a penny stock? Good for them. That's survivorship bias — you don't hear about the 100 people who lost money on the same stock. Do your own research, always.", type: "warning" },
          { heading: "Mistake 3: Checking Portfolio Daily", body: "If you're a long-term investor, checking daily prices is harmful. It triggers emotional reactions and impulsive decisions. Review monthly or quarterly. Your portfolio is a garden — don't uproot plants to check if roots are growing.", type: "tip" },
          { heading: "Mistake 4: No Exit Strategy", body: "Know when you'll sell BEFORE you buy. Set a target price and stop-loss. Without an exit plan, greed keeps you holding too long and fear makes you sell too early.", type: "warning" },
        ]
      },
    ],
    quiz: [
      { question: "The 'Rule of 100' suggests a 25-year-old should allocate __% to equity:", options: ["25%", "50%", "75%", "100%"], correctIndex: 2, explanation: "Rule of 100: Equity allocation = 100 - age = 100 - 25 = 75% in equity." },
      { question: "Before investing, you should first have:", options: ["A trading setup", "An emergency fund of 6 months expenses", "A demat account", "A mentor"], correctIndex: 1, explanation: "An emergency fund prevents you from being forced to sell investments during personal financial crises." },
    ]
  },
];
