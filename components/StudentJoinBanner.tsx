"use client";

import { useState, useEffect } from "react";
import { getNearestSchedule } from "@/actions/tutor.action";
import JoinClassButton from "@/components/JoinClassButton";
import { minutesToTime } from "@/models/tutor.model";

interface StudentJoinBannerProps {
  tutorGroup: any;
}

export default function StudentJoinBanner({ tutorGroup }: StudentJoinBannerProps) {
  const [isLinkActive, setIsLinkActive] = useState<boolean>(false);
  const [hasMeetLink, setHasMeetLink] = useState<boolean>(false);
  const [nearestSchedule, setNearestSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isSubscribed = true;

    const fetchStatus = async () => {
      try {
        const res = await getNearestSchedule();
        if (isSubscribed && res?.success && res.data) {
          setNearestSchedule(res.data);
          setIsLinkActive((res.data as any).status === "active");
          setHasMeetLink(Boolean(res.data.googleMeetLink || res.data.pseudoLink));
        }
      } catch (error) {
        console.error("Failed to fetch schedule status:", error);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    fetchStatus();

    return () => {
      isSubscribed = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-5 border rounded-xl bg-gray-50 border-gray-200 animate-pulse flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-md" />
      </div>
    );
  }

  return (
    <div
      className={`p-5 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${
        isLinkActive
          ? "bg-emerald-50 border-emerald-300 shadow-sm"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 text-base">
            {tutorGroup
              ? `Tutor: ${
                  (tutorGroup.tutor as any)?.gender === "male"
                    ? "Ustadh"
                    : "Ustadhah"
                } ${(tutorGroup.tutor as any)?.user?.name || "Assigned Ustadh"}`
              : "You have not been assigned to a tutor yet."}
          </h3>
          {isLinkActive && (
            <span className="text-xs bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full animate-pulse">
              Class Live
            </span>
          )}
        </div>
        {tutorGroup && (
          <p className="text-sm text-gray-600">
            {nearestSchedule
              ? `Weekly Slot: ${nearestSchedule.dayOfWeek}s (${minutesToTime(
                  nearestSchedule.startTime
                )} - ${minutesToTime(nearestSchedule.endTime)})`
              : "No upcoming schedule found."}
          </p>
        )}
      </div>

      {tutorGroup ? (
        <div className="flex items-center gap-3">
          {(tutorGroup?.tutor as any)?.user?.whatsappNumber && (
            <a
              href={`https://wa.me/${(tutorGroup?.tutor as any).user.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition"
            >
              Contact Ustadh
            </a>
          )}
          <JoinClassButton
            link={`/join/${tutorGroup?._id}`}
            isLinkActive={isLinkActive}
            meetLinkAvailable={hasMeetLink}
          />
        </div>
      ) : null}
    </div>
  );
}