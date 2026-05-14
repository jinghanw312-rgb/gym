import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { SportsLog } from '../services/sportsService';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

interface ProgressChartProps {
  logs: SportsLog[];
}

export default function ProgressChart({ logs }: ProgressChartProps) {
  // Generate last 7 days data
  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayLogs = logs.filter(log => {
      const logDate = log.timestamp instanceof Date 
        ? log.timestamp 
        : (log.timestamp && typeof (log.timestamp as any).toDate === 'function')
          ? (log.timestamp as any).toDate() 
          : new Date(0);
      return isSameDay(startOfDay(logDate), startOfDay(date));
    });

    return {
      name: format(date, 'MM/dd'),
      calories: dayLogs.reduce((sum, log) => sum + (log.kcal || 0), 0),
    };
  });

  return (
    <div className="glass rounded-[2.5rem] p-8 border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">熱量消耗趨勢</h3>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">Calorie Consumption Trend</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black italic text-pink-500">
            {data.reduce((sum, d) => sum + d.calories, 0)}
          </p>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">7-Day Total Kcal</p>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
              dy={10}
            />
            <YAxis 
              hide={true} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #ffffff10', 
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#fff'
              }}
              itemStyle={{ color: '#ec4899' }}
            />
            <Area 
              type="monotone" 
              dataKey="calories" 
              stroke="#ec4899" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorKcal)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
