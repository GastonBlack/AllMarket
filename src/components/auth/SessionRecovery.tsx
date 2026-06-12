"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { usersService } from "@/services/users.service";

interface SessionRecoveryProps {
    failureContent: React.ReactNode;
}

export default function SessionRecovery({
    failureContent,
}: SessionRecoveryProps) {
    const router = useRouter();
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let isActive = true;

        usersService
            .getMe()
            .then(() => {
                if (isActive) {
                    router.refresh();
                }
            })
            .catch(() => {
                if (isActive) {
                    setFailed(true);
                }
            });

        return () => {
            isActive = false;
        };
    }, [router]);

    if (failed) {
        return failureContent;
    }

    return (
        <div className="flex min-h-80 items-center justify-center text-sm text-zinc-600">
            Restoring your session...
        </div>
    );
}
