"use client";

import { ArrowLeft, Check, Dot, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import { getApiError } from "@/lib/axios";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
    const { push, refresh } = useRouter();
    const { showNotification } = useNotification();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isFullNameValid = fullName.trim().length >= 3;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;
    const isAddressValid = address.trim().length >= 5;
    const canSubmit =
        isFullNameValid &&
        isEmailValid &&
        isPasswordValid &&
        isAddressValid &&
        !isSubmitting;

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setApiError("");

        if (!canSubmit) {
            return;
        }

        const normalizedPhone = phone.replace(/\D/g, "");

        setIsSubmitting(true);

        try {
            await authService.register({
                fullName,
                email,
                password,
                address,
                phone: normalizedPhone || null,
            });
            showNotification(
                "Your account has been created. Check your email for the verification code.",
                "success",
            );
            push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
            refresh();
        } catch (error) {
            const message =
                getApiError(error)?.message ??
                "Could not create your account. Please try again later.";
            setApiError(message);
            showNotification(message, "error");
        }

        setIsSubmitting(false);
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
            <section className="w-full max-w-3xl rounded-lg border border-red-200/50 bg-white p-6 shadow-xl shadow-red-500/20 md:p-8">
                <div className="flex w-full justify-start">
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
                        Create account
                    </h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Join AllMarket and start shopping.
                    </p>
                </div>

                <form className="mt-8 space-y-6" noValidate onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-5">
                            <div>
                                <label
                                    className="text-sm font-medium text-zinc-800"
                                    htmlFor="fullName"
                                >
                                    Full name
                                </label>
                                <input
                                    aria-label="Full name"
                                    autoComplete="name"
                                    className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                    id="fullName"
                                    name="fullName"
                                    onChange={(event) => setFullName(event.target.value)}
                                    placeholder="Jane Doe"
                                    type="text"
                                    value={fullName}
                                />
                                <div
                                    className={`mt-2 flex items-center gap-2 text-xs ${
                                        isFullNameValid
                                            ? "text-green-600"
                                            : "text-zinc-500"
                                    }`}
                                >
                                    {isFullNameValid ? (
                                        <Check aria-hidden="true" size={14} />
                                    ) : (
                                        <Dot aria-hidden="true" size={14} />
                                    )}
                                    <span>Enter at least 3 characters.</span>
                                </div>
                            </div>

                            <div>
                                <label
                                    className="text-sm font-medium text-zinc-800"
                                    htmlFor="email"
                                >
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
                                    className={`mt-2 flex items-center gap-2 text-xs ${
                                        isEmailValid
                                            ? "text-green-600"
                                            : "text-zinc-500"
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
                                <label
                                    className="text-sm font-medium text-zinc-800"
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <div className="relative mt-2">
                                    <input
                                        aria-label="Password"
                                        autoComplete="new-password"
                                        className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 pr-11 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                        id="password"
                                        name="password"
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Your password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                    />
                                    <button
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                                        onClick={() =>
                                            setShowPassword((current) => !current)
                                        }
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
                                    className={`mt-2 flex items-center gap-2 text-xs ${
                                        isPasswordValid
                                            ? "text-green-600"
                                            : "text-zinc-500"
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
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label
                                    className="text-sm font-medium text-zinc-800"
                                    htmlFor="address"
                                >
                                    Address
                                </label>
                                <input
                                    aria-label="Address"
                                    autoComplete="street-address"
                                    className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                    id="address"
                                    name="address"
                                    onChange={(event) => setAddress(event.target.value)}
                                    placeholder="123 Market Street, Apt 4"
                                    type="text"
                                    value={address}
                                />
                                <div
                                    className={`mt-2 flex items-center gap-2 text-xs ${
                                        isAddressValid
                                            ? "text-green-600"
                                            : "text-zinc-500"
                                    }`}
                                >
                                    {isAddressValid ? (
                                        <Check aria-hidden="true" size={14} />
                                    ) : (
                                        <Dot aria-hidden="true" size={14} />
                                    )}
                                    <span>Enter at least 5 characters.</span>
                                </div>
                            </div>

                            <div>
                                <label
                                    className="text-sm font-medium text-zinc-800"
                                    htmlFor="phone"
                                >
                                    Phone
                                </label>
                                <input
                                    aria-label="Phone"
                                    autoComplete="tel"
                                    className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                    id="phone"
                                    inputMode="tel"
                                    name="phone"
                                    onChange={(event) => setPhone(event.target.value)}
                                    placeholder="+021 142 024"
                                    type="tel"
                                    value={phone}
                                />
                                <p className="mt-2 text-xs text-zinc-500">
                                    Optional. Spaces and symbols are removed before
                                    saving.
                                </p>
                            </div>
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
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-600">
                    Already have an account?{" "}
                    <Link className="font-medium text-zinc-950 hover:underline" href="/login">
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}
