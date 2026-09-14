"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Zap, Users, UserCheck } from "lucide-react";

interface AdminNavProps {
    userEmail?: string;
}

const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/assignments", label: "Auto-Assign Engine", icon: Zap },
    { href: "/admin/groups", label: "Tutor Groups", icon: Users },
    { href: "/admin/students", label: "Students List", icon: UserCheck },
];

export default function AdminNav({ userEmail }: AdminNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand / Title & Badge */}
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-lg font-bold text-[#022c22] tracking-tight">
                            Admin Portal
                        </h1>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800">
                            Restricted
                        </span>
                    </div>

                    {/* Desktop Navigation Links (Visible on md+) */}
                    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive
                                        ? "bg-[#022c22] text-white font-semibold"
                                        : "text-gray-600 hover:text-[#022c22] hover:bg-emerald-50"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile Hamburger Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-[#022c22] hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            aria-expanded={isOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile / Tablet Slide-out Drawer */}
            {isOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
                    <div className="px-2 pb-2 mb-2 border-b border-gray-100 text-xs text-gray-500">
                        Signed in as <span className="font-semibold text-gray-800">{userEmail}</span>
                    </div>

                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${isActive
                                    ? "bg-[#022c22] text-white"
                                    : "text-gray-700 hover:bg-emerald-50 hover:text-[#022c22]"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}