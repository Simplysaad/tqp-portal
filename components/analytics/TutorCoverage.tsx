"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function TutorCoverage({ data }: { data: any[] }) {
  // data from tutorCoverage aggregation: [{_id: {hasTutor: "assigned"}, count: X}]
  const formatted = data.map(d => ({
    name: d._id.hasTutor === "assigned" ? "Assigned" : "Unassigned",
    value: d.count
  }));

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={formatted} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
            <Cell fill="#22c55e" />
            <Cell fill="#ef4444" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}