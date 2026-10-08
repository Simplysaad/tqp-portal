"use client";

import React, { useEffect, useState } from "react";
import { Printer, RefreshCw } from "lucide-react";
import { AssignmentTableRow, getTutorGroupAssignmentsTable } from "@/actions/assignment.action";

export default function AssignmentTableView() {
  const [data, setData] = useState<AssignmentTableRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await getTutorGroupAssignmentsTable();
    if (res.success) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="md:p-6 space-y-6">
        
      {/* Action Bar (Hidden when printing) */}
      <div className="flex not-md:flex-wrap gap-4 items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Tutor Group Assignments</h1>
          <p className="text-xs text-zinc-500">Overview of all active tutor groups, assigned tutors, and students.</p>
        </div>
        <div className="flex  items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 border rounded-lg text-zinc-600 hover:bg-zinc-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition"
          >
            <Printer className="w-4 h-4" /> Print Assignment Table
          </button>
        </div>
      </div>

      {/* Print Header (Visible only when printing) */}
      <div className="hidden print:block mb-4 border-b pb-2">
        <h1 className="text-2xl font-bold text-zinc-900">Tutor Group Assignments</h1>
        <p className="text-xs text-zinc-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
              <th className="p-3 border-r border-zinc-200">Group / Tutor Info</th>
              <th className="p-3 border-r border-zinc-200">Schedule & Capacity</th>
              <th className="p-3">Assigned Students</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {data.map((row) => (
              <tr key={row.groupId} className="align-top hover:bg-zinc-50/50">
                {/* Group & Tutor Details */}
                <td className="p-3 border-r border-zinc-200 space-y-1 w-1/4">
                  <div className="font-bold text-zinc-900">{row.groupName}</div>
                  <div className="text-zinc-600">
                    <span className="font-semibold text-zinc-800">Tutor:</span> {row.tutorName}
                  </div>
                  <div className="text-zinc-400 text-[11px]">{row.tutorEmail}</div>
                </td>

                {/* Schedule & Capacity Details */}
                <td className="p-3 border-r border-zinc-200 space-y-1 w-1/4">
                  <div>
                    <span className="font-semibold text-zinc-700">Capacity:</span> {row.capacity}
                  </div>
                  <div className="text-zinc-600">
                    <span className="font-semibold text-zinc-700">Schedule:</span> {row.schedulesSummary}
                  </div>
                </td>

                {/* Enrolled Students Table */}
                <td className="p-3 w-1/2">
                  {row.students.length === 0 ? (
                    <span className="text-zinc-400 italic">No students assigned</span>
                  ) : (
                    <ul className="divide-y divide-zinc-100">
                      {row.students.map((student) => (
                        <li key={student.id} className="py-1.5 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-zinc-800">{student.name}</span>
                            <span className="text-zinc-400 text-[10px] ml-2">({student.email})</span>
                          </div>
                          <div className="flex gap-2 text-[11px] text-zinc-500">
                            <span className="px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-600">
                              Juz {student.juz}
                            </span>
                            <span className="capitalize">{student.gender}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}