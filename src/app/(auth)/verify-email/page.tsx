"use client";

import { ArrowLeft, MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import { getApiError } from "@/lib/axios";
import { authService } from "@/services/auth.service";

export default function VerifyEmailPage() {
    const { push } = useRouter();
    const { showNotification } = useNotification();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [apiError, setApiError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const normalizedEmail = email.trim().toLowerCase();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    const isCodeValid = /^\d{6}$/.test(code);
    const canVerify = isEmailValid && isCodeValid && !isVerifying;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get("email") ?? "");
    }, []);

    async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setApiError("");

        if (!canVerify) return;

        setIsVerifying(true);

        try {
            await authService.verifyEmail({
                email: normalizedEmail,
                code,
            });
            showNotification("Your email has been verified. You can now sign in.", "success");
            push("/login");
        } catch (error) {
            const message =
                getApiError(error)?.message ??
                "Could not verify your email. Please try again.";

            if (message.toLowerCase().includes("already verified")) {
                setIsVerifying(false);
                showNotification(message, "success");
                push("/login");
                return;
            }

            setApiError(message);
            showNotification(message, "error");
        }

        setIsVerifying(false);
    }

    async function handleResend() {
        setApiError("");

        if (!isEmailValid || isResending) return;

        setIsResending(true);

        try {
            await authService.resendEmailVerificationCode({
                email: normalizedEmail,
            });
            showNotification("A new verification code has been sent.", "success");
        } catch (error) {
            const message =
                getApiError(error)?.message ??
                "Could not resend the verification code. Please try again.";

            if (message.toLowerCase().includes("already verified")) {
                setIsResending(false);
                showNotification(message, "success");
                window.setTimeout(() => push("/login"), 1200);
                return;
            }

            setApiError(message);
            showNotification(message, "error");
        }

        setIsResending(false);
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
            <section className="w-full max-w-2xl rounded-lg border border-red-200/50 bg-white p-6 shadow-xl shadow-red-500/20 sm:p-8">
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

                <div className="mt-8 grid w-full gap-8 text-center md:grid-cols-[0.9fr_1.1fr] md:items-center">
                    <div>
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <MailCheck aria-hidden="true" size={24} />
                        </div>
                        <h1 className="mt-5 text-2xl font-semibold text-zinc-950">
                            Verify your email
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-zinc-600">
                            We sent a 6-digit code to your email. Enter it here to activate
                            your account.
                        </p>

                        <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Code sent to
                            </p>
                            <p className="mt-1 break-all text-sm font-medium text-zinc-950">
                                {email || "Your email"}
                            </p>
                        </div>
                    </div>

                    <form className="space-y-5" noValidate onSubmit={handleVerify}>
                        <div>
                            <label className="text-sm font-medium text-zinc-800" htmlFor="code">
                                Verification code
                            </label>
                            <input
                                aria-label="Verification code"
                                autoComplete="one-time-code"
                                autoFocus
                                className="mt-2 h-14 w-full rounded-md border border-zinc-300 bg-white px-3 text-center text-2xl font-semibold tracking-[0.45em] text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                id="code"
                                inputMode="numeric"
                                maxLength={6}
                                name="code"
                                onChange={(event) =>
                                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                                }
                                placeholder="000000"
                                type="text"
                                value={code}
                            />
                        </div>

                        {apiError && (
                            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {apiError}
                            </p>
                        )}

                        <button
                            className="h-11 w-full cursor-pointer rounded-md bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                            disabled={!canVerify}
                            type="submit"
                        >
                            {isVerifying ? "Verifying..." : "Verify account"}
                        </button>

                        <button
                            className="w-full cursor-pointer rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                            disabled={!isEmailValid || isResending}
                            onClick={handleResend}
                            type="button"
                        >
                            {isResending ? "Sending code..." : "Resend verification code"}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-zinc-600">
                    Already verified?{" "}
                    <Link className="font-medium text-zinc-950 hover:underline" href="/login">
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}
