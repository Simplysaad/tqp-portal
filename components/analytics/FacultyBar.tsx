// "use client";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// export function FacultyBar({ data }: { data: { _id: string, count: number }[] }) {
//   const formatted = data.map(d => ({ name: d._id || "Unknown", count: d.count }));

//   return (
//     // <div className="w-full h-[300px]">
//     //   <ResponsiveContainer width="100%" height="100%">
//     //     <BarChart data={formatted} layout="vertical" margin={{ left: 40 }}>
//     //       <XAxis type="number" allowDecimals={false} />
//     //       <YAxis type="category" dataKey="name" width={100} fontSize={12} />
//     //       <Tooltip />
//     //       <Bar dataKey="count" fill="#111827" radius={[0, 8, 8, 0]} />
//     //     </BarChart>
//     //   </ResponsiveContainer>
//     // </div>


    
//   );
// }


export function FacultyBar({ data }: { data: any[] }) {
  // 1. Filter out faculties with 0 students and ensure clean sorting
  const filteredData = data
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  // 2. Dynamic height based on number of items to prevent crowding (e.g., 35px per row)
  const dynamicHeight = Math.max(300, filteredData.length * 35);

  return (
    <div className="w-full" style={{ height: `${dynamicHeight}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={filteredData} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <XAxis type="number" allowDecimals={false} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={160} // Increased width to fit long faculty names comfortably
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={0} // Forces Recharts to show every label without skipping
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }}
          />
          <Bar dataKey="count" fill="#111827" radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}