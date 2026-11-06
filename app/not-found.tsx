"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Home,
  UserPlus,
  LogIn,
  BookOpen,
  Calendar,
  Users,
  Settings,
  Layers,
  Table,
  ArrowRight,
  HelpCircle,
  Video,
} from "lucide-react";
import { usePathname } from "next/navigation";

type Role = "student" | "tutor" | "admin";

interface RouteItem {
  label: string;
  href: string;
  description: string;
  icon: React.ElementType;
}

export default function NotFound() {
  
  const [activeRole, setActiveRole] = useState<Role>("student");
  const path = usePathname();
  const pathSegments = path.split("/").filter(Boolean);
  const isAdminPath = pathSegments[0] === "admin";

  useEffect(() => {
    if (isAdminPath) {
      setActiveRole("admin");
    }
  }, [isAdminPath]);
  

  // Sitemap categorized by user roles matching your app routes
  const roleRoutes: Record<
    Role,
    { title: string; subtitle: string; links: RouteItem[] }
  > = {
    student: {
      title: "Student Portal Quick Links",
      subtitle:
        "Find your dashboard, join live sessions, or enroll with a tutor.",
      links: [
        {
          label: "Student Dashboard",
          href: "/dashboard",
          description: "View your active group, schedules, and progress",
          icon: BookOpen,
        },
        {
          label: "Enroll with a Tutor",
          href: "/enroll",
          description: "Browse available tutors and register for a group",
          icon: UserPlus,
        },
        {
          label: "Student Onboarding",
          href: "/onboarding",
          description: "Complete your profile setup and preferences",
          icon: Compass,
        },
        {
          label: "Account Login",
          href: "/login",
          description: "Sign in to access your student account",
          icon: LogIn,
        },
        {
          label: "Register New Account",
          href: "/register",
          description: "Create a new student account to get started",
          icon: UserPlus,
        },
      ],
    },
    tutor: {
      title: "Tutor Portal Quick Links",
      subtitle:
        "Manage your assigned sessions, student lists, and account settings.",
      links: [
        {
          label: "Tutor Dashboard",
          href: "/dashboard",
          description: "View your assigned tutor groups and schedule",
          icon: Calendar,
        },
        {
          label: "Account Login",
          href: "/login",
          description: "Sign in to manage your tutoring groups",
          icon: LogIn,
        },
        {
          label: "Tutor Onboarding",
          href: "/onboarding",
          description: "Complete your tutor profile and availability",
          icon: Settings,
        },
      ],
    },
    admin: {
      title: "Admin Management Links",
      subtitle:
        "Complete access to group management, assignments, and user records.",
      links: [
        {
          label: "Admin Dashboard",
          href: "/admin/dashboard",
          description: "Overview of system activity and key metrics",
          icon: ShieldCheck,
        },
        {
          label: "Group Management",
          href: "/admin/groups",
          description: "View all tutor groups and create new ones",
          icon: Layers,
        },
        {
          label: "Create New Group",
          href: "/admin/groups/create",
          description: "Setup a new tutor group with rules",
          icon: UserPlus,
        },
        {
          label: "Student Directory",
          href: "/admin/students",
          description: "View and manage all registered students",
          icon: Users,
        },
        {
          label: "Tutor Directory",
          href: "/admin/tutors",
          description: "View and manage all active tutors",
          icon: UserCheck,
        },
        {
          label: "Assignments Hub",
          href: "/admin/assignments",
          description: "Overview of tutor-student assignments",
          icon: Settings,
        },
        {
          label: "Batch Reassignment",
          href: "/admin/assignments/batch",
          description: "Reassign multiple students at once",
          icon: Layers,
        },
        {
          label: "Individual Reassignment",
          href: "/admin/assignments/reassign",
          description: "Transfer a student to another tutor group",
          icon: UserCheck,
        },
        {
          label: "Master Assignment Table",
          href: "/admin/assignments/table",
          description: "Printable master table of all assignments",
          icon: Table,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between p-4 sm:p-8 text-zinc-900 font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-8 py-8">
        {/* 404 Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 text-emerald-900 rounded-full text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" /> 404 — Page Not Found
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Lost your way? Let&apos;s get you back on track.
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 max-w-lg mx-auto">
            The page you are looking for doesn&apos;t exist or has moved. Select
            your role below to find where you need to go.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-zinc-200/80 rounded-xl space-x-1 text-xs sm:text-sm font-medium">
            {!isAdminPath ? (
              <span className="inline-flex gap-1">
                <button
                  onClick={() => setActiveRole("student")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeRole === "student"
                      ? "bg-white text-zinc-900 shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-700" />I am a
                  Student
                </button>
                <button
                  onClick={() => setActiveRole("tutor")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeRole === "tutor"
                      ? "bg-white text-zinc-900 shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-700" />I am a Tutor
                </button>
              </span>
            ) : (
              <button
                onClick={() => setActiveRole("admin")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeRole === "admin"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Admin Portal
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Role Navigation Cards */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-base font-bold text-zinc-900">
              {roleRoutes[activeRole].title}
            </h2>
            <p className="text-xs text-zinc-500">
              {roleRoutes[activeRole].subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roleRoutes[activeRole].links.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-3.5 border border-zinc-100 rounded-xl hover:border-emerald-800/30 hover:bg-emerald-50/40 transition flex items-start gap-3.5"
                >
                  <div className="p-2 bg-emerald-100/60 rounded-lg text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-950 transition truncate">
                        {item.label}
                      </span>
                      <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Universal Options & General Pages */}
        <div className="p-4 bg-zinc-100/80 rounded-xl border border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-600">
            <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>Looking for general public pages?</span>
          </div>
          <div className="flex items-center gap-4 font-medium text-emerald-800">
            <Link href="/" className="hover:underline flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <Link href="/landing" className="hover:underline">
              Landing Page
            </Link>
            <Link href="/login" className="hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="text-center text-xs text-zinc-400 py-4 border-t border-zinc-200/60">
        &copy; {new Date().getFullYear()} Tutor Group Assignment System. All
        rights reserved.
      </footer>
    </div>
  );
}
