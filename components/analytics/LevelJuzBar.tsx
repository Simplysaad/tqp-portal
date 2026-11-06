"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LEVEL_COLORS: Record<string, string> = {
  "100": "#dbeafe",
  "200": "#60a5fa",
  "300": "#2563eb",
  "400": "#1e3a8a",
  "500": "#111827"
};

export function LevelJuzBar({ data }: { data: any[] }) {
  // data = levelPivot from lib/analytics.ts
  const levels = ["100","200","300","400","500"];

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="juz" angle={-45} textAnchor="end" height={60} fontSize={11} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {levels.map(lvl => (
            <Bar key={lvl} dataKey={lvl} stackId="a" fill={LEVEL_COLORS[lvl]} name={`${lvl} Level`} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}