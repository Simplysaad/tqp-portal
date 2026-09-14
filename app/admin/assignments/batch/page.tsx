import { Metadata } from "next";
import { generateOSFAMetadata } from "@/lib/metadata";
import { BatchAutoAssignForm } from "./BatchAutoAssignmentForm";

export const metadata: Metadata = generateOSFAMetadata({
    path: "/admin/assignments/batch",
    title: "Batch Auto-Assignment Engine | TQP Admin",
    description: "Automatically match unassigned students into tutor groups according to capacity, gender restrictions, and memorisation levels.",
});

export default function BatchAutoAssignPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <BatchAutoAssignForm />
        </div>
    );
}