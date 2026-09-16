"use client";

import { ConfirmDialog, DialogVariant } from "@/components/ConfirmDialog";
import React, { useState, useCallback } from "react";
// import { ConfirmDialog, DialogVariant } ;

interface ConfirmOptions {
    title: string;
    message: string;
    variant?: DialogVariant;
    confirmText?: string;
    cancelText?: string;
}

export function useConfirm() {
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        type: "alert" | "confirm";
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                type: "confirm",
                options,
                resolve,
            });
        });
    }, []);

    const alert = useCallback(
        (options: Omit<ConfirmOptions, "cancelText">): Promise<boolean> => {
            return new Promise((resolve) => {
                setDialogState({
                    isOpen: true,
                    type: "alert",
                    options,
                    resolve,
                });
            });
        },
        []
    );

    const handleConfirm = () => {
        dialogState?.resolve(true);
        setDialogState(null);
    };

    const handleCancel = () => {
        dialogState?.resolve(false);
        setDialogState(null);
    };

    const DialogComponent = dialogState ? (
        <ConfirmDialog
            isOpen={dialogState.isOpen}
            type={dialogState.type}
            title={dialogState.options.title}
            message={dialogState.options.message}
            variant={dialogState.options.variant}
            confirmText={dialogState.options.confirmText}
            cancelText={dialogState.options.cancelText}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    ) : null;

    return { confirm, alert, DialogComponent };
}