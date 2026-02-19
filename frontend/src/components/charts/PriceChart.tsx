"use client";

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area
} from 'recharts';
import { OHLCV } from '@/types/start';

interface PriceChartProps {
  data: OHLCV[];
  height?: number;
  period?: '1d' | '1w' | '1m' | '3m' | '1y';
}

export const PriceChart = ({ data, height = 400, period = '1m' }: PriceChartProps) => {
  // Format data for chart
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: new Date(item.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      }),
      fullDate: item.timestamp, // Use ISO string or similar for sorting if needed
      displayDate: new Date(item.timestamp).toLocaleDateString(),
      price: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data]);

  const minPrice = useMemo(() => Math.min(...chartData.map(d => d.price)), [chartData]);
  const maxPrice = useMemo(() => Math.max(...chartData.map(d => d.price)), [chartData]);
  const maxVolume = useMemo(() => Math.max(...chartData.map(d => d.volume)), [chartData]);
  
  const padding = (maxPrice - minPrice) * 0.1;

  if (chartData.length === 0) {
      return (
          <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl">
              No price data available
          </div>
      );
  }

  // Determine trend color
  const startPrice = chartData[0]?.price || 0;
  const endPrice = chartData[chartData.length - 1]?.price || 0;
  const isPositive = endPrice >= startPrice;
  const strokeColor = isPositive ? "#10b981" : "#f43f5e"; // emerald-500 : rose-500
  const fillColor = isPositive ? "url(#colorPvGreen)" : "url(#colorPvRed)";

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPvGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPvRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
            minTickGap={30}
            interval="preserveStartEnd"
          />
          
          {/* Price Axis */}
          <YAxis 
            yAxisId="left"
            domain={[minPrice - padding, maxPrice + padding]}
            hide={false}
            orientation="right"
            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `$${val.toFixed(2)}`}
            width={50}
          />

          {/* Volume Axis (Hidden, scaled to keep bars at bottom) */}
          <YAxis 
            yAxisId="right"
            domain={[0, maxVolume * 4]} // Make volume take bottom 25%
            hide={true}
            orientation="left"
          />

          <Tooltip 
            // ... no change to props ...
            // Wait, I need to see the formatter function.
            contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 10, 0.95)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
            labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
            formatter={(value: any, name: any) => {
                if (name === 'Volume') return [new Intl.NumberFormat('en-US', { notation: "compact" }).format(value), name];
                return [`$${Number(value).toFixed(2)}`, 'Price'];
            }}
            labelFormatter={(label, payload) => payload[0]?.payload.displayDate || label}
          />
          
          <Bar 
            yAxisId="right"
            dataKey="volume" 
            fill={isPositive ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)"}
            barSize={4}
            radius={[2, 2, 0, 0]} 
          />
          
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="price" 
            stroke={strokeColor} 
            strokeWidth={3}
            fillOpacity={1} 
            fill={fillColor} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
