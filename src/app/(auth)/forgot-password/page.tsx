"use client";

import { ArrowLeft, KeyRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import { getApiError } from "@/lib/axios";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
    const { push } = useRouter();
    const { showNotification } = useNotification();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [apiError, setApiError] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const normalizedEmail = email.trim().toLowerCase();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    const isCodeValid = /^\d{6}$/.test(code);
    const isPasswordValid = newPassword.length >= 8 && newPassword.length <= 100;
    const canSendCode = isEmailValid && !isSendingCode;
    const canReset =
        isEmailValid &&
        isCodeValid &&
        isPasswordValid &&
        newPassword === confirmPassword &&
        !isResetting;

    async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setApiError("");

        if (!canSendCode) return;

        setIsSendingCode(true);

        try {
            await authService.forgotPassword({ email: normalizedEmail });
            setCodeSent(true);
            showNotification("If the email exists, a reset code has been sent.", "success");
        } catch (error) {
            const message =
                getApiError(error)?.message ??
                "Could not send the reset code. Please try again.";
            setApiError(message);
            showNotification(message, "error");
        }

        setIsSendingCode(false);
    }

    async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setApiError("");

        if (newPassword !== confirmPassword) {
            const message = "New passwords do not match.";
            setApiError(message);
            showNotification(message, "error");
            return;
        }

        if (!canReset) return;

        setIsResetting(true);

        try {
            await authService.resetPassword({
                email: normalizedEmail,
                code,
                newPassword,
            });
            showNotification("Password reset successfully. You can now sign in.", "success");
            push("/login");
        } catch (error) {
            const message =
                getApiError(error)?.message ??
                "Could not reset your password. Please try again.";
            setApiError(message);
            showNotification(message, "error");
        }

        setIsResetting(false);
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
            <section className="w-full max-w-xl rounded-lg border border-red-200/50 bg-white p-6 shadow-xl shadow-red-500/20 sm:p-8">
                <div className="flex w-full items-center justify-between">
                    <button
                        aria-label="Back to login"
                        className="cursor-pointer text-zinc-950 transition hover:text-zinc-600"
                        onClick={() => push("/login")}
                        type="button"
                    >
                        <ArrowLeft aria-hidden="true" size={20} />
                    </button>

                    <Link aria-label="AllMarket home" href="/">
                        <Image
                            alt="AllMarket"
                            height={48}
                            priority
                            src="/favicon.ico"
                            width={48}
                        />
                    </Link>
                </div>

                <div className="mt-8 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <KeyRound aria-hidden="true" size={24} />
                    </div>
                    <h1 className="mt-5 text-2xl font-semibold text-zinc-950">
                        Reset password
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                        Enter your email and we will send you a code to create a new password.
                    </p>
                </div>

                {!codeSent ? (
                    <form className="mt-8 space-y-5" noValidate onSubmit={handleSendCode}>
                        <div>
                            <label className="text-sm font-medium text-zinc-800" htmlFor="email">
                                Email
                            </label>
                            <input
                                aria-label="Email"
                                autoComplete="email"
                                className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                id="email"
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                type="email"
                                value={email}
                            />
                        </div>

                        {apiError && (
                            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {apiError}
                            </p>
                        )}

                        <button
                            className="h-11 w-full cursor-pointer rounded-md bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                            disabled={!canSendCode}
                            type="submit"
                        >
                            {isSendingCode ? "Sending code..." : "Send reset code"}
                        </button>
                    </form>
                ) : (
                    <form className="mt-8 space-y-5" noValidate onSubmit={handleResetPassword}>
                        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Code sent to
                            </p>
                            <p className="mt-1 break-all text-sm font-medium text-zinc-950">
                                {normalizedEmail}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-zinc-800" htmlFor="code">
                                Reset code
                            </label>
                            <input
                                aria-label="Reset code"
                                autoComplete="one-time-code"
                                className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-center text-xl font-semibold tracking-[0.45em] text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                id="code"
                                inputMode="numeric"
                                maxLength={6}
                                onChange={(event) =>
                                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                                }
                                placeholder="000000"
                                type="text"
                                value={code}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-zinc-800" htmlFor="new-password">
                                New password
                            </label>
                            <input
                                aria-label="New password"
                                autoComplete="new-password"
                                className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                id="new-password"
                                onChange={(event) => setNewPassword(event.target.value)}
                                type="password"
                                value={newPassword}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-zinc-800" htmlFor="confirm-password">
                                Confirm password
                            </label>
                            <input
                                aria-label="Confirm password"
                                autoComplete="new-password"
                                className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                id="confirm-password"
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                type="password"
                                value={confirmPassword}
                            />
                        </div>

                        {apiError && (
                            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {apiError}
                            </p>
                        )}

                        <button
                            className="h-11 w-full cursor-pointer rounded-md bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                            disabled={!canReset}
                            type="submit"
                        >
                            {isResetting ? "Resetting..." : "Reset password"}
                        </button>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-zinc-600">
                    Remembered your password?{" "}
                    <Link className="font-medium text-zinc-950 hover:underline" href="/login">
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}
