import { getAnalyticsData } from "@/lib/analytics";
import AnalyticsClient from "./AnalyticsClient";
import { Users, BookOpen, UserCheck, GraduationCap } from "lucide-react";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Program Analytics</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi icon={Users} label="Total Students" value={data.total} />
        <Kpi icon={BookOpen} label="Most Populated Juz" value={`Juz ${[...data.juzTimePivot].sort((a,b)=>b.total-a.total)[0]?.juzNum}`} />
        <Kpi icon={UserCheck} label="Assigned Tutors" value={data.tutorCoverage.find(t=>t._id.hasTutor==="assigned")?.count || 0} />
        <Kpi icon={GraduationCap} label="At Risk" value={data.byStatus.find(s=>s._id==="at risk")?.count || 0} />
      </div>

      <AnalyticsClient {...data} />
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: any) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex items-center gap-2 text-sm text-zinc-500"><Icon size={16} />{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}