import React, { useState } from "react";
import { CheckCircle2, AlertCircle, User, Group, XCircle } from "lucide-react";

export default function AssignmentResultsReport({ resultSummary }: { resultSummary: any }) {
    const [filter, setFilter] = useState<"all" | "assigned" | "unassigned">("all");

    if (!resultSummary) return null;

    const { totalRequested, assignedCount, unassignedCount, results = [] } = resultSummary;

    const filteredResults = results.filter((res: any) => {
        if (filter === "assigned") return res.assigned;
        if (filter === "unassigned") return !res.assigned;
        return true;
    });

    // Helper to parse joined failure reasons into readable bullet lists
    const parseReasons = (reasonStr?: string) => {
        if (!reasonStr) return ["No reason provided."];
        if (reasonStr.includes("Failures: [") && reasonStr.endsWith("]")) {
            const rawList = reasonStr.substring(reasonStr.indexOf("[") + 1, reasonStr.lastIndexOf("]"));
            return rawList.split(" | ").map((r) => r.trim());
        }
        return [reasonStr];
    };

    return (
        <div className="mt-6 p-6 bg-zinc-50 rounded-xl border border-zinc-200 space-y-5 shadow-sm">
            {/* Header & Metrics Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-200">
                <div>
                    <h2 className="font-bold text-zinc-900 text-base">Auto-Assignment Execution Report</h2>
                    <p className="text-xs text-zinc-500">{resultSummary.message}</p>
                </div>

                {/* Filter Toggles */}
                <div className="flex items-center gap-1 bg-zinc-200/60 p-1 rounded-lg text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1 rounded-md transition ${
                            filter === "all" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                        }`}
                    >
                        All ({results.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("assigned")}
                        className={`px-3 py-1 rounded-md transition ${
                            filter === "assigned" ? "bg-white text-emerald-700 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                        }`}
                    >
                        Assigned ({assignedCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("unassigned")}
                        className={`px-3 py-1 rounded-md transition ${
                            filter === "unassigned" ? "bg-white text-amber-700 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                        }`}
                    >
                        Unassigned ({unassignedCount})
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-2xs">
                    <p className="text-xs font-medium text-zinc-500">Total Requested</p>
                    <p className="text-2xl font-bold text-zinc-900">{totalRequested}</p>
                </div>
                <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <p className="text-xs font-medium text-emerald-600">Assigned</p>
                    <p className="text-2xl font-bold text-emerald-700">{assignedCount}</p>
                </div>
                <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-100 shadow-2xs">
                    <p className="text-xs font-medium text-amber-600">Unassigned</p>
                    <p className="text-2xl font-bold text-amber-700">{unassignedCount}</p>
                </div>
            </div>

            {/* Results Detailed List */}
            <div className="divide-y divide-zinc-200 max-h-80 overflow-y-auto pr-1">
                {filteredResults.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400">
                        No students match the selected filter.
                    </div>
                ) : (
                    filteredResults.map((res: any, idx: number) => {
                        const failureReasons = !res.assigned ? parseReasons(res.reason) : [];

                        return (
                            <div key={res.studentId || idx} className="py-3.5 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-zinc-200/50 rounded-full text-zinc-600">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-zinc-900 block">
                                                {res.studentName || "Unknown Student"}
                                            </span>
                                            <span className="font-mono text-[10px] text-zinc-400">
                                                ID: {res.studentId}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {res.assigned ? (
                                        <div className="flex items-center gap-2">
                                            {res.assignedGroupId && (
                                                <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-100 text-zinc-700 rounded border border-zinc-200 flex items-center gap-1">
                                                    <Group className="w-3 h-3 text-zinc-400" />
                                                    Group: {res.assignedGroupId}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100/70 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                Assigned
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100/70 text-amber-800 rounded-full text-xs font-semibold border border-amber-200">
                                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                            Unassigned
                                        </span>
                                    )}
                                </div>

                                {/* Failure Diagnostic Details */}
                                {!res.assigned && (
                                    <div className="ml-8 p-3 bg-amber-50/60 rounded-lg border border-amber-200/60 space-y-1.5 text-xs">
                                        <p className="font-medium text-amber-900 flex items-center gap-1">
                                            <XCircle className="w-3.5 h-3.5 text-amber-600" />
                                            Assignment Failure Diagnostics:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-amber-800/90 pl-1 text-[11px]">
                                            {failureReasons.map((reasonItem, rIdx) => (
                                                <li key={rIdx} className="leading-tight">
                                                    {reasonItem}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}