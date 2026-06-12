"use client";

import { Check, CircleAlert } from "lucide-react";
import { createContext, use, useRef, useState } from "react";

type NotificationType = "error" | "success";

interface Notification {
    message: string;
    type: NotificationType;
}

interface NotificationContextValue {
    showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
    null,
);

export default function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [notification, setNotification] = useState<Notification | null>(null);
    const timeoutRef = useRef<number | null>(null);

    function showNotification(message: string, type: NotificationType) {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }

        setNotification({ message, type });
        timeoutRef.current = window.setTimeout(() => {
            setNotification(null);
        }, 3000);
    }

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <div
                    className={`fixed left-1/2 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 rounded-md border px-5 py-3 text-center text-sm font-medium shadow-lg ${notification.type === "success"
                            ? "border-zinc-300 bg-white text-black"
                            : "border-red-600 bg-white text-red-700"
                        }`}
                    role={
                        notification.type === "error" ? "alert" : "status"
                    }
                >
                    {notification.type === "success" ? (
                        <Check aria-hidden={true} size={18} />
                    ) : (
                        <CircleAlert aria-hidden={true} size={18} />
                    )}
                    {notification.message}
                </div>
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = use(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotification must be used within NotificationProvider.",
        );
    }

    return context;
}
