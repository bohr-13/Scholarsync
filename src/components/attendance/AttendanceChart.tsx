'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { SubjectAttendance } from '@/types';

interface AttendanceChartProps {
  subjects: SubjectAttendance[];
}

function getBarColor(percentage: number): string {
  if (percentage >= 80) return '#10b981';
  if (percentage >= 75) return '#f59e0b';
  return '#f43f5e';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: SubjectAttendance;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[#0B0F19]/95 backdrop-blur-xl p-3 shadow-xl">
      <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{data.name}</p>
      <p className="text-xs text-[var(--text-secondary)] mb-2">{data.code}</p>
      <div className="space-y-1">
        <p className="text-xs text-[var(--text-primary)]/90">
          Attendance: <span className="font-semibold">{data.percentage}%</span>
        </p>
        <p className="text-xs text-[var(--text-primary)]/90">
          Classes: <span className="font-semibold">{data.attended}/{data.total}</span>
        </p>
        <p className="text-xs text-[var(--text-primary)]/90">
          Safe Bunks: <span className="font-semibold">{data.safeBunks}</span>
        </p>
      </div>
    </div>
  );
}

export default function AttendanceChart({ subjects }: AttendanceChartProps) {
  const chartData = subjects.map((s) => ({
    ...s,
    shortName: s.code,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-[320px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
          <XAxis
            dataKey="shortName"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#1F2937' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
          />
          <ReferenceLine
            y={75}
            stroke="rgba(245, 158, 11, 0.4)"
            strokeDasharray="6 4"
            label={{
              value: '75% min',
              position: 'insideTopRight',
              fill: '#f59e0b',
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          <Bar
            dataKey="percentage"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.percentage)}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
