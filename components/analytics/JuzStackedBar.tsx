"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function JuzStackedBar({ data, mode }: { data: any[], mode: "time" | "gender" }) {
  return (
    <div className="w-full h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="juz" interval={0} angle={-45} textAnchor="end" height={60} fontSize={11} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {mode === "time" ? (
            <>
              <Bar dataKey="morning" stackId="a" fill="#fbbf24" name="Morning" />
              <Bar dataKey="afternoon" stackId="a" fill="#60a5fa" name="Afternoon" />
              <Bar dataKey="night" stackId="a" fill="#1f2937" name="Night" />
            </>
          ) : (
            <>
              <Bar dataKey="male" stackId="a" fill="#3b82f6" name="Male" />
              <Bar dataKey="female" stackId="a" fill="#ec4899" name="Female" />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}