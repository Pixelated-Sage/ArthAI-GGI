"use client";

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createChart, ColorType, CrosshairMode, LineStyle } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, HistogramData, LineData, Time } from 'lightweight-charts';
import { format, addDays } from 'date-fns';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, RefreshCw, CandlestickChart, LineChart } from 'lucide-react';

interface StockData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PredictionData {
  price: number;
  confidence: number;
  change_percent?: number;
  signal?: string;
}

interface StockChartProps {
  data: StockData[];
  predictions?: Record<string, PredictionData>;
  symbol: string;
  period?: string;
}

type ChartMode = 'candle' | 'line';

// Helper to convert date string to YYYY-MM-DD format for lightweight-charts
const toChartTime = (ts: string): Time => {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` as Time;
};

export const StockChart: React.FC<StockChartProps> = ({ data, predictions, symbol, period = '7d' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>('candle');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setLastUpdate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sort data ascending (oldest first)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [data]);

  // Calculate stats from data
  const stats = useMemo(() => {
    if (sortedData.length === 0) return null;
    const last = sortedData[sortedData.length - 1];
    const prices = sortedData.map(d => d.close);
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const dayChange = last.close - last.open;
    const dayChangePct = (dayChange / last.open) * 100;
    const periodChange = endPrice - startPrice;
    const periodChangePct = (periodChange / startPrice) * 100;

    return {
      currentPrice: endPrice,
      dayOpen: last.open,
      dayHigh: last.high,
      dayLow: last.low,
      dayChange,
      dayChangePct,
      volume: last.volume,
      periodChange,
      periodChangePct,
      isDayPositive: dayChange >= 0,
    };
  }, [sortedData]);

  // Build + Destroy chart
  useEffect(() => {
    if (!chartContainerRef.current || sortedData.length === 0) return;

    // Clean previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(128, 128, 128, 0.06)' },
        horzLines: { color: 'rgba(128, 128, 128, 0.06)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(99, 102, 241, 0.3)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#4f46e5',
        },
        horzLine: {
          color: 'rgba(99, 102, 241, 0.3)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#4f46e5',
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.08,
          bottom: 0.22,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        fixLeftEdge: true,
        fixRightEdge: false,
        rightOffset: predictions ? 15 : 5,
      },
      handleScroll: { vertTouchDrag: false },
      width: container.clientWidth,
      height: container.clientHeight,
    });

    chartRef.current = chart;

    // ------ MAIN SERIES ------
    if (chartMode === 'candle') {
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
        borderUpColor: '#10b981',
        borderDownColor: '#f43f5e',
      });

      const candleData: CandlestickData[] = sortedData.map(d => ({
        time: toChartTime(d.timestamp),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      candleSeries.setData(candleData);
    } else {
      // Area chart
      const isPositive = stats ? stats.periodChangePct >= 0 : true;
      const color = isPositive ? '#10b981' : '#f43f5e';

      const areaSeries = chart.addAreaSeries({
        lineColor: color,
        topColor: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
        bottomColor: isPositive ? 'rgba(16, 185, 129, 0.01)' : 'rgba(244, 63, 94, 0.01)',
        lineWidth: 2,
        crosshairMarkerRadius: 5,
        crosshairMarkerBorderColor: color,
        crosshairMarkerBackgroundColor: '#fff',
      });

      const lineData = sortedData.map(d => ({
        time: toChartTime(d.timestamp),
        value: d.close,
      }));

      areaSeries.setData(lineData);
    }

    // ------ VOLUME HISTOGRAM ------
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const volumeData: HistogramData[] = sortedData.map(d => ({
      time: toChartTime(d.timestamp),
      value: d.volume,
      color: d.close >= d.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
    }));

    volumeSeries.setData(volumeData);

    // ------ FORECAST LINE ------
    if (predictions) {
      const forecastSeries = chart.addLineSeries({
        color: '#6366f1',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        crosshairMarkerRadius: 5,
        crosshairMarkerBorderColor: '#6366f1',
        crosshairMarkerBackgroundColor: '#6366f1',
        lastValueVisible: true,
        priceLineVisible: false,
      });

      const lastDate = new Date(sortedData[sortedData.length - 1].timestamp);
      const lastClose = sortedData[sortedData.length - 1].close;

      // Start forecast from last close price
      const forecastData: LineData[] = [
        { time: toChartTime(lastDate.toISOString()), value: lastClose },
      ];

      const horizons = [1, 7, 30];
      for (const h of horizons) {
        const key = `${h}d`;
        if (predictions[key]) {
          const date = addDays(lastDate, h);
          forecastData.push({
            time: toChartTime(date.toISOString()),
            value: predictions[key].price,
          });
        }
      }

      forecastSeries.setData(forecastData);

      // Add forecast markers
      const markers: any[] = [];
      for (const h of horizons) {
        const key = `${h}d`;
        if (predictions[key]) {
          const date = addDays(lastDate, h);
          const pred = predictions[key];
          const isUp = (pred.change_percent || 0) >= 0;
          markers.push({
            time: toChartTime(date.toISOString()),
            position: isUp ? 'aboveBar' : 'belowBar',
            color: '#6366f1',
            shape: isUp ? 'arrowUp' : 'arrowDown',
            text: `${key}: ₹${pred.price.toFixed(0)}`,
          });
        }
      }
      if (markers.length > 0) {
        forecastSeries.setMarkers(markers);
      }
    }

    chart.timeScale().fitContent();

    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (chartRef.current) {
          chartRef.current.applyOptions({ width, height });
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [sortedData, predictions, chartMode, stats]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full bg-card/30 border border-border/50 rounded-3xl p-8 flex flex-col items-center justify-center text-muted-foreground gap-4 min-h-[400px]">
        <div className="animate-pulse w-12 h-12 rounded-full bg-muted"></div>
        <p className="font-medium">Waiting for market data...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="w-full h-full bg-card/30 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 flex-shrink-0 border-b border-border/30">
        <div>
          <div className="flex items-baseline gap-3 mb-1">
            <h3 className="text-3xl font-black tracking-tight tabular-nums">
              ₹{stats.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </h3>
            <div className={cn(
              "flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg",
              stats.isDayPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500"
            )}>
              {stats.isDayPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {stats.isDayPositive ? '+' : ''}{stats.dayChange.toFixed(2)}
              ({stats.isDayPositive ? '+' : ''}{stats.dayChangePct.toFixed(2)}%)
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
            <span>O: <span className="text-foreground font-bold">₹{stats.dayOpen.toFixed(2)}</span></span>
            <span>H: <span className="text-emerald-500 font-bold">₹{stats.dayHigh.toFixed(2)}</span></span>
            <span>L: <span className="text-rose-500 font-bold">₹{stats.dayLow.toFixed(2)}</span></span>
            <span>Vol: <span className="text-foreground font-bold">{(stats.volume / 1000000).toFixed(2)}M</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Chart Type Toggle */}
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setChartMode('candle')}
              className={cn(
                "p-2 rounded-md transition-all",
                chartMode === 'candle'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Candlestick"
            >
              <CandlestickChart size={16} />
            </button>
            <button
              onClick={() => setChartMode('line')}
              className={cn(
                "p-2 rounded-md transition-all",
                chartMode === 'line'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Area"
            >
              <LineChart size={16} />
            </button>
          </div>

          {/* Symbol & Live */}
          <div className="flex flex-col items-end gap-0.5">
            <div className="text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded-lg border border-border/30">
              {symbol}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <RefreshCw size={9} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span className="tabular-nums">{format(lastUpdate, 'HH:mm:ss')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TradingView Canvas */}
      <div ref={chartContainerRef} className="flex-1 min-h-[380px]" />

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground bg-background/30">
        <div className="flex items-center gap-4">
          <span>Period: <span className="font-bold text-foreground">{sortedData.length} days</span></span>
          <span className={cn("font-bold", stats.periodChangePct >= 0 ? "text-emerald-500" : "text-rose-500")}>
            {stats.periodChangePct >= 0 ? '+' : ''}{stats.periodChange.toFixed(2)}
            ({stats.periodChangePct >= 0 ? '+' : ''}{stats.periodChangePct.toFixed(2)}%)
          </span>
        </div>
        {predictions && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-[2px] rounded" style={{ borderBottom: '2px dashed #6366f1' }} />
            <span className="text-indigo-500 font-bold">AI Forecast</span>
          </div>
        )}
      </div>
    </div>
  );
};
