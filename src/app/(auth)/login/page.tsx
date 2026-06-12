"use client";

import { ArrowLeft, Check, Dot, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import { setUserDisplayCookies } from "@/lib/authCookies";
import { getApiError } from "@/lib/axios";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
    const { push, refresh } = useRouter();
    const { showNotification } = useNotification();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;
    const canSubmit = isEmailValid && isPasswordValid && !isSubmitting;

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setApiError("");

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        setIsSubmitting(true);

        try {
            const user = await authService.login({ email, password });
            setUserDisplayCookies(user);
            showNotification("Signed in successfully.", "success");
            push("/");
            refresh();
        } catch (error) {
            const message =
                getApiError(error)?.message ??
                "Could not sign in. Please try again later.";
            setApiError(message);
            showNotification(message, "error");
        }

        setIsSubmitting(false);
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <section className="w-92 max-w-full rounded-lg border border-red-200/50 bg-white p-6 shadow-xl shadow-red-500/20">
                <div className="flex w-full items-center justify-start">
                    <button
                        aria-label="Back to home"
                        className="cursor-pointer text-zinc-950 transition hover:text-zinc-600"
                        onClick={() => push("/")}
                        type="button"
                    >
                        <ArrowLeft aria-hidden="true" size={20} />
                    </button>
                </div>
                <div className="flex flex-col items-center text-center">
                    <Link aria-label="AllMarket home" href="/">
                        <Image
                            src="/favicon.ico"
                            alt="AllMarket"
                            width={64}
                            height={64}
                            priority
                        />
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
                        Sign in
                    </h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Access your AllMarket account.
                    </p>
                </div>

                <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-zinc-800" htmlFor="email">
                            Email
                        </label>
                        <input
                            aria-label="Email"
                            autoComplete="email"
                            className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                            id="email"
                            name="email"
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            type="email"
                            value={email}
                        />
                        <div
                            className={`mt-2 flex items-center gap-2 text-xs ${isEmailValid ? "text-green-600" : "text-zinc-500"
                                }`}
                        >
                            {isEmailValid ? (
                                <Check aria-hidden="true" size={14} />
                            ) : (
                                <Dot aria-hidden="true" size={14} />
                            )}
                            <span>Enter a valid email address.</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-zinc-800" htmlFor="password">
                            Password
                        </label>
                        <div className="relative mt-2">
                            <input
                                aria-label="Password"
                                autoComplete="current-password"
                                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 pr-11 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                id="password"
                                name="password"
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Your password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                            />
                            <button
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                                onClick={() => setShowPassword((current) => !current)}
                                type="button"
                            >
                                {showPassword ? (
                                    <EyeOff aria-hidden="true" size={18} />
                                ) : (
                                    <Eye aria-hidden="true" size={18} />
                                )}
                            </button>
                        </div>
                        <div
                            className={`mt-2 flex items-center gap-2 text-xs ${isPasswordValid ? "text-green-600" : "text-zinc-500"
                                }`}
                        >
                            {isPasswordValid ? (
                                <Check aria-hidden="true" size={14} />
                            ) : (
                                <Dot aria-hidden="true" size={14} />
                            )}
                            <span>Password must be at least 6 characters.</span>
                        </div>
                    </div>

                    {apiError && (
                        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {apiError}
                        </p>
                    )}

                    <button
                        className="h-11 w-full cursor-pointer rounded-md bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                        disabled={!canSubmit}
                        type="submit"
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-600">
                    Don&apos;t have an account?{" "}
                    <Link className="font-medium text-zinc-950 hover:underline" href="/register">
                        Create one
                    </Link>
                </p>
            </section>
        </main>
    );
}
