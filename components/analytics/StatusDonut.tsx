"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
  active: "#22c55e",
  "at risk": "#f59e0b",
  inactive: "#ef4444"
};

export function StatusDonut({ data }: { data: { _id: string, count: number }[] }) {
  const formatted = data.map(d => ({ name: d._id, value: d.count }));
  
  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={formatted} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} label>
            {formatted.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.name] || "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}