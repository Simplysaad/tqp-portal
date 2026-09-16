"use client";

import React, { useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type DialogVariant = "info" | "success" | "warning" | "danger";

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: "alert" | "confirm";
    variant?: DialogVariant;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const variantStyles: Record<
    DialogVariant,
    { bg: string; text: string; button: string; icon: React.ReactNode }
> = {
    info: {
        bg: "bg-blue-50 text-blue-600",
        text: "text-blue-900",
        button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        icon: <Info className="w-6 h-6" />,
    },
    success: {
        bg: "bg-emerald-50 text-emerald-600",
        text: "text-emerald-900",
        button: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
        icon: <CheckCircle2 className="w-6 h-6" />,
    },
    warning: {
        bg: "bg-amber-50 text-amber-600",
        text: "text-amber-900",
        button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
        icon: <AlertTriangle className="w-6 h-6" />,
    },
    danger: {
        bg: "bg-red-50 text-red-600",
        text: "text-red-900",
        button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        icon: <AlertCircle className="w-6 h-6" />,
    },
};

export function ConfirmDialog({
    isOpen,
    title,
    message,
    type = "confirm",
    variant = "warning",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onCancel();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const currentVariant = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <div className="flex items-start space-x-4">
                        <div
                            className={`p-3 rounded-xl flex-shrink-0 ${currentVariant.bg}`}
                        >
                            {currentVariant.icon}
                        </div>

                        <div className="flex-1 pt-1">
                            <h3 className="text-base font-semibold text-gray-900">
                                {title}
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-3">
                        {type === "confirm" && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentVariant.button}`}
                        >
                            {type === "alert" ? "OK" : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}