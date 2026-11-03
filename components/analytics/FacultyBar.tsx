"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function FacultyBar({ data }: { data: { _id: string, count: number }[] }) {
  const formatted = data.map(d => ({ name: d._id || "Unknown", count: d.count }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} layout="vertical" margin={{ left: 40 }}>
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={100} fontSize={12} />
          <Tooltip />
          <Bar dataKey="count" fill="#111827" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}