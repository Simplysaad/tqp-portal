"use client";

import { useState, useEffect } from "react";
import { autoAssignStudentsToTutorGroups, getUnassignedStudentIds } from "@/actions/assignment.action";
import { Zap, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { generateOSFAMetadata } from "@/lib/metadata";


export const metadata = generateOSFAMetadata({
    path: "/admin/assignments/batch",
    title: "Batch Auto-Assignment Engine | TQP Admin",
    description: "Automatically match unassigned students into tutor groups according to capacity, gender restrictions, and memorisation levels.",
})

export default function BatchAutoAssignPage() {
    const [studentIdsInput, setStudentIdsInput] = useState("");
    const [fetchingIds, setFetchingIds] = useState(true);
    const [loading, setLoading] = useState(false);
    const [resultSummary, setResultSummary] = useState<any>(null);

    // Fetch pending unassigned student IDs once on component mount
    useEffect(() => {
        let isMounted = true;

        async function fetchPendingIds() {
            try {
                const data = await getUnassignedStudentIds();
                if (isMounted && Array.isArray(data)) {
                    // Join array of IDs into a clean comma-separated string
                    setStudentIdsInput(data.join(", "));
                }
            } catch (err) {
                console.error("Failed to fetch unassigned student IDs:", err);
            } finally {
                if (isMounted) setFetchingIds(false);
            }
        }

        fetchPendingIds();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleRunAutoAssign = async () => {
        setLoading(true);
        const ids = studentIdsInput
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id.length > 0);

        try {
            const res = await autoAssignStudentsToTutorGroups(ids);
            setResultSummary(res);

            // Optionally clear or refresh state if auto-assign succeeded
            if (res.success) {
                const updatedIds = await getUnassignedStudentIds();
                if (Array.isArray(updatedIds)) {
                    setStudentIdsInput(updatedIds.join(", "));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-5">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">Batch Auto-Assignment Engine</h1>
                        <p className="text-xs text-zinc-500">
                            Automatically matches unassigned students into tutor groups according to rules and availability.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                            Comma-separated Student IDs
                        </label>
                        {fetchingIds && (
                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Loading pending IDs...
                            </span>
                        )}
                    </div>

                    <textarea
                        rows={4}
                        value={studentIdsInput}
                        onChange={(e) => setStudentIdsInput(e.target.value)}
                        placeholder="663a..., 663b..., 663c..."
                        disabled={fetchingIds || loading}
                        className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-zinc-50 disabled:text-zinc-400"
                    />

                    <button
                        onClick={handleRunAutoAssign}
                        disabled={loading || fetchingIds}
                        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium text-sm py-3 rounded-lg transition-colors shadow-sm"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Execute Auto-Assignment Logic
                    </button>
                </div>

                {/* Results Report Card */}
                {resultSummary && (
                    <div className="mt-6 p-6 bg-zinc-50 rounded-xl border border-zinc-200 space-y-4">
                        <h2 className="font-bold text-zinc-900 text-base">Execution Summary Report</h2>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white p-3 rounded-lg border border-zinc-200">
                                <p className="text-xs text-zinc-400">Total Requested</p>
                                <p className="text-xl font-bold text-zinc-900">{resultSummary.summary?.totalRequested}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-zinc-200">
                                <p className="text-xs text-zinc-400">Assigned</p>
                                <p className="text-xl font-bold text-emerald-600">{resultSummary.summary?.assignedCount}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-zinc-200">
                                <p className="text-xs text-zinc-400">Unassigned</p>
                                <p className="text-xl font-bold text-amber-600">{resultSummary.summary?.unassignedCount}</p>
                            </div>
                        </div>

                        <div className="divide-y divide-zinc-200 max-h-60 overflow-y-auto">
                            {resultSummary.summary?.results?.map((res: any, idx: number) => (
                                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                                    <span className="font-mono">{res.studentName || res.studentId}</span>
                                    {res.assigned ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Assigned
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                                            <AlertCircle className="w-3.5 h-3.5" /> {res.reason}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}