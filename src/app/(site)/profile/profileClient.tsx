"use client";

import {
    KeyRound,
    LockKeyhole,
    LogOut,
    ShieldCheck,
    UserRound,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import {
    clearUserDisplayCookies,
    setUserDisplayCookie,
} from "@/lib/authCookies";
import { getApiError } from "@/lib/axios";
import { authService } from "@/services/auth.service";
import { usersService } from "@/services/users.service";
import type { UserProfileDto } from "@/types";
import { formatDate } from "@/utils/formatters";

type ProfileSection = "data" | "security";
type ProfileValidationErrors = Partial<
    Record<"fullName" | "address" | "phone", string>
>;

const FULL_NAME_PATTERN = /^[\p{L}\s]+$/u;
const ADDRESS_PATTERN = /^[\p{L}\p{N}\s.,]+$/u;
const PHONE_PATTERN = /^\d*$/;

function getProfileValidationErrors(
    fullName: string,
    address: string,
    phone: string,
): ProfileValidationErrors {
    const errors: ProfileValidationErrors = {};
    const trimmedFullName = fullName.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFullName) {
        errors.fullName = "Full name is required.";
    } else if (trimmedFullName.length < 2 || trimmedFullName.length > 120) {
        errors.fullName = "Full name must be between 2 and 120 characters.";
    } else if (!FULL_NAME_PATTERN.test(trimmedFullName)) {
        errors.fullName = "Full name can contain only letters and spaces.";
    }

    if (!trimmedAddress) {
        errors.address = "Address is required.";
    } else if (trimmedAddress.length < 5 || trimmedAddress.length > 250) {
        errors.address = "Address must be between 5 and 250 characters.";
    } else if (!ADDRESS_PATTERN.test(trimmedAddress)) {
        errors.address =
            "Address can contain only letters, numbers, spaces, dots, and commas.";
    }

    if (trimmedPhone.length > 30) {
        errors.phone = "Phone cannot exceed 30 characters.";
    } else if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
        errors.phone = "Phone can contain only numbers.";
    }

    return errors;
}

function ModifiedBadge() {
    return (
        <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-950 ring-1 ring-yellow-300">
            modified
        </span>
    );
}

export default function ProfileClient() {
    const { push, refresh } = useRouter();
    const { showNotification } = useNotification();
    const [activeSection, setActiveSection] = useState<ProfileSection>("data");
    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordCode, setPasswordCode] = useState("");
    const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSendingPasswordCode, setIsSendingPasswordCode] = useState(false);
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const trimmedFullName = fullName.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();
    const profileValidationErrors = getProfileValidationErrors(
        fullName,
        address,
        phone,
    );
    const hasProfileValidationErrors =
        Object.keys(profileValidationErrors).length > 0;
    const isFullNameModified = profile
        ? trimmedFullName !== profile.fullName
        : false;
    const isAddressModified = profile
        ? trimmedAddress !== profile.address
        : false;
    const isPhoneModified = profile
        ? trimmedPhone !== (profile.phone ?? "")
        : false;
    const hasProfileChanges =
        isFullNameModified || isAddressModified || isPhoneModified;
    const canSaveProfile =
        hasProfileChanges && !hasProfileValidationErrors && !isSaving;

    useEffect(() => {
        let isActive = true;

        async function loadProfile() {
            setIsLoading(true);
            setError("");

            try {
                const user = await usersService.getMe();

                if (!isActive) {
                    return;
                }

                setProfile(user);
                setFullName(user.fullName);
                setAddress(user.address);
                setPhone(user.phone ?? "");
                setIsLoading(false);
            } catch (loadError) {
                if (!isActive) {
                    return;
                }

                setError(
                    getApiError(loadError)?.message ??
                    "Could not load your profile.",
                );
                setIsLoading(false);
            }
        }

        void loadProfile();

        return () => {
            isActive = false;
        };
    }, []);

    async function handleSaveData(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!canSaveProfile) {
            return;
        }

        setIsSaving(true);

        try {
            const updatedProfile = await usersService.updateMe({
                address: trimmedAddress,
                fullName: trimmedFullName,
                phone: trimmedPhone || null,
            });

            setProfile(updatedProfile);
            setFullName(updatedProfile.fullName);
            setAddress(updatedProfile.address);
            setPhone(updatedProfile.phone ?? "");
            setUserDisplayCookie("username", updatedProfile.fullName);
            window.dispatchEvent(new Event("user-cookie-change"));
            showNotification("Profile updated successfully.", "success");
        } catch (saveError) {
            const message =
                getApiError(saveError)?.message ??
                "Could not update your profile.";
            setError(message);
            showNotification(message, "error");
        }

        setIsSaving(false);
    }

    function resetPasswordForm() {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordCode("");
        setPasswordError("");
    }

    function handleTogglePasswordForm() {
        setIsPasswordFormOpen((current) => {
            if (current) {
                resetPasswordForm();
            }

            return !current;
        });
    }

    async function handleChangePassword(
        event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setPasswordError("");

        if (newPassword !== confirmPassword) {
            const message = "New passwords do not match.";
            setPasswordError(message);
            showNotification(message, "error");
            return;
        }

        if (!/^\d{6}$/.test(passwordCode)) {
            const message = "Enter the 6-digit code sent to your email.";
            setPasswordError(message);
            showNotification(message, "error");
            return;
        }

        setIsChangingPassword(true);

        try {
            await usersService.changePassword({
                currentPassword,
                newPassword,
                code: passwordCode,
            });

            resetPasswordForm();
            setIsPasswordFormOpen(false);
            showNotification("Password updated successfully.", "success");
        } catch (changeError) {
            const message =
                getApiError(changeError)?.message ??
                "Could not update your password.";
            setPasswordError(message);
            showNotification(message, "error");
        }

        setIsChangingPassword(false);
    }

    async function handleRequestPasswordCode() {
        setPasswordError("");
        setIsSendingPasswordCode(true);

        try {
            await usersService.requestPasswordChangeCode();
            showNotification("Password change code sent to your email.", "success");
        } catch (codeError) {
            const message =
                getApiError(codeError)?.message ??
                "Could not send the password change code.";
            setPasswordError(message);
            showNotification(message, "error");
        }

        setIsSendingPasswordCode(false);
    }

    async function handleLogout() {
        setIsLoggingOut(true);

        try {
            await authService.logout();
        } catch {
            // Local logout cleanup should still run if the API session is already gone.
        }

        clearUserDisplayCookies();
        setIsLoggingOut(false);
        showNotification("Signed out successfully.", "success");
        push("/");
        refresh();
    }

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
            <section className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-950 ring-1 ring-yellow-300">
                        <UserRound aria-hidden="true" size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-950">
                            Profile options
                        </h1>
                        <p className="mt-1 text-sm text-zinc-600">
                            Manage your account details and security.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <aside className="self-start rounded-lg border border-zinc-200 bg-white p-2 shadow-sm lg:sticky lg:top-24">
                        <button
                            className={`flex h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition ${activeSection === "data"
                                    ? "bg-zinc-950 text-white"
                                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                                }`}
                            onClick={() => setActiveSection("data")}
                            type="button"
                        >
                            <UserRound aria-hidden="true" size={17} />
                            Data
                        </button>
                        <button
                            className={`mt-1 flex h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition ${activeSection === "security"
                                    ? "bg-zinc-950 text-white"
                                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                                }`}
                            onClick={() => setActiveSection("security")}
                            type="button"
                        >
                            <ShieldCheck aria-hidden="true" size={17} />
                            Security
                        </button>
                    </aside>

                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="h-7 w-48 rounded-md bg-zinc-100" />
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="h-20 rounded-md bg-zinc-100" />
                                    <div className="h-20 rounded-md bg-zinc-100" />
                                    <div className="h-20 rounded-md bg-zinc-100" />
                                    <div className="h-20 rounded-md bg-zinc-100" />
                                </div>
                            </div>
                        ) : error && !profile ? (
                            <div className="flex min-h-72 items-center justify-center text-center">
                                <div>
                                    <XCircle
                                        aria-hidden="true"
                                        className="mx-auto text-red-600"
                                        size={34}
                                    />
                                    <h2 className="mt-4 text-lg font-semibold text-zinc-950">
                                        Profile unavailable
                                    </h2>
                                    <p className="mt-2 text-sm text-zinc-600">{error}</p>
                                    <Link
                                        className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
                                        href="/login"
                                    >
                                        Sign in
                                    </Link>
                                </div>
                            </div>
                        ) : activeSection === "data" && profile ? (
                            <form onSubmit={handleSaveData}>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-zinc-950">
                                            Data
                                        </h2>
                                        <p className="mt-1 text-sm text-zinc-600">
                                            Member since {formatDate(profile.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {error}
                                    </p>
                                )}

                                <div className="mt-6 grid gap-5 md:grid-cols-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <label
                                                className="text-sm font-medium text-zinc-800"
                                                htmlFor="profile-full-name"
                                            >
                                                Full name
                                            </label>
                                            {isFullNameModified && <ModifiedBadge />}
                                        </div>
                                        <input
                                            aria-label="Full name"
                                            className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm text-zinc-950 outline-none transition focus:ring-2 ${profileValidationErrors.fullName
                                                    ? "border-red-300 focus:border-red-600 focus:ring-red-100"
                                                    : "border-zinc-300 focus:border-zinc-950 focus:ring-zinc-200"
                                                }`}
                                            id="profile-full-name"
                                            onChange={(event) =>
                                                setFullName(event.target.value)
                                            }
                                            type="text"
                                            value={fullName}
                                        />
                                        {profileValidationErrors.fullName && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {profileValidationErrors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            className="text-sm font-medium text-zinc-800"
                                            htmlFor="profile-email"
                                        >
                                            Email
                                        </label>
                                        <input
                                            aria-label="Email"
                                            className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500"
                                            disabled
                                            id="profile-email"
                                            readOnly
                                            type="email"
                                            value={profile.email}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <label
                                                className="text-sm font-medium text-zinc-800"
                                                htmlFor="profile-phone"
                                            >
                                                Phone
                                            </label>
                                            {isPhoneModified && <ModifiedBadge />}
                                        </div>
                                        <input
                                            aria-label="Phone"
                                            className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm text-zinc-950 outline-none transition focus:ring-2 ${profileValidationErrors.phone
                                                    ? "border-red-300 focus:border-red-600 focus:ring-red-100"
                                                    : "border-zinc-300 focus:border-zinc-950 focus:ring-zinc-200"
                                                }`}
                                            id="profile-phone"
                                            inputMode="numeric"
                                            onChange={(event) => setPhone(event.target.value)}
                                            placeholder="021142024"
                                            type="text"
                                            value={phone}
                                        />
                                        {profileValidationErrors.phone && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {profileValidationErrors.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <label
                                                className="text-sm font-medium text-zinc-800"
                                                htmlFor="profile-address"
                                            >
                                                Address
                                            </label>
                                            {isAddressModified && <ModifiedBadge />}
                                        </div>
                                        <input
                                            aria-label="Address"
                                            className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm text-zinc-950 outline-none transition focus:ring-2 ${profileValidationErrors.address
                                                    ? "border-red-300 focus:border-red-600 focus:ring-red-100"
                                                    : "border-zinc-300 focus:border-zinc-950 focus:ring-zinc-200"
                                                }`}
                                            id="profile-address"
                                            onChange={(event) =>
                                                setAddress(event.target.value)
                                            }
                                            type="text"
                                            value={address}
                                        />
                                        {profileValidationErrors.address && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {profileValidationErrors.address}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="mt-6 h-11 cursor-pointer rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                                    disabled={!canSaveProfile}
                                    type="submit"
                                >
                                    {isSaving ? "Saving..." : "Save changes"}
                                </button>
                            </form>
                        ) : (
                            <div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-950">
                                        Security
                                    </h2>
                                    <p className="mt-1 text-sm text-zinc-600">
                                        Manage password access and active session controls.
                                    </p>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <section className="rounded-lg border border-zinc-200 bg-white p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex gap-3">
                                                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-950 ring-1 ring-yellow-300">
                                                    <KeyRound aria-hidden="true" size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-zinc-950">
                                                        Password
                                                    </h3>
                                                    <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-600">
                                                        Keep your account protected by updating
                                                        your password with an email verification code.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                className="h-10 cursor-pointer rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
                                                onClick={handleTogglePasswordForm}
                                                type="button"
                                            >
                                                {isPasswordFormOpen
                                                    ? "Cancel"
                                                    : "Change password"}
                                            </button>
                                        </div>

                                        {isPasswordFormOpen && (
                                            <form
                                                className="mt-5 grid gap-4 border-t border-zinc-100 pt-5 md:grid-cols-2"
                                                onSubmit={handleChangePassword}
                                            >
                                                <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm leading-6 text-yellow-950 md:col-span-2">
                                                    <p className="font-medium">
                                                        How password changes work
                                                    </p>
                                                    <p className="mt-1">
                                                        First request a 6-digit code, then enter your
                                                        current password, your new password, and the code
                                                        sent to your email.
                                                    </p>
                                                </div>

                                                {passwordError && (
                                                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
                                                        {passwordError}
                                                    </p>
                                                )}
                                                <div className="grid gap-4 md:col-span-2 md:grid-cols-[auto_minmax(0,1fr)] md:items-end">
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-800">
                                                            Verification code
                                                        </p>
                                                        <p className="mt-1 text-xs text-zinc-500">
                                                            Send a 6-digit code to your email.
                                                        </p>
                                                        <button
                                                            className="mt-2 h-12 w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400 md:w-auto"
                                                            disabled={isSendingPasswordCode}
                                                            onClick={handleRequestPasswordCode}
                                                            type="button"
                                                        >
                                                            {isSendingPasswordCode
                                                                ? "Sending code..."
                                                                : "Send code"}
                                                        </button>
                                                    </div>

                                                    <div>
                                                        <label
                                                            className="text-sm font-medium text-zinc-800"
                                                            htmlFor="password-code"
                                                        >
                                                            Email verification code
                                                        </label>
                                                        <input
                                                            aria-label="Email code"
                                                            autoComplete="one-time-code"
                                                            className="mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-3 text-center text-xl font-semibold tracking-[0.45em] text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                                            id="password-code"
                                                            inputMode="numeric"
                                                            maxLength={6}
                                                            onChange={(event) =>
                                                                setPasswordCode(
                                                                    event.target.value
                                                                        .replace(/\D/g, "")
                                                                        .slice(0, 6),
                                                                )
                                                            }
                                                            placeholder="000000"
                                                            required
                                                            type="text"
                                                            value={passwordCode}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label
                                                        className="text-sm font-medium text-zinc-800"
                                                        htmlFor="current-password"
                                                    >
                                                        Current password
                                                    </label>
                                                    <input
                                                        aria-label="Current password"
                                                        className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                                        id="current-password"
                                                        autoComplete="current-password"
                                                        onChange={(event) =>
                                                            setCurrentPassword(
                                                                event.target.value,
                                                            )
                                                        }
                                                        required
                                                        type="password"
                                                        value={currentPassword}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        className="text-sm font-medium text-zinc-800"
                                                        htmlFor="new-password"
                                                    >
                                                        New password
                                                    </label>
                                                    <input
                                                        aria-label="New password"
                                                        className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                                        id="new-password"
                                                        autoComplete="new-password"
                                                        onChange={(event) =>
                                                            setNewPassword(
                                                                event.target.value,
                                                            )
                                                        }
                                                        required
                                                        type="password"
                                                        value={newPassword}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        className="text-sm font-medium text-zinc-800"
                                                        htmlFor="confirm-password"
                                                    >
                                                        Confirm password
                                                    </label>
                                                    <input
                                                        aria-label="Confirm password"
                                                        className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                                        id="confirm-password"
                                                        autoComplete="new-password"
                                                        onChange={(event) =>
                                                            setConfirmPassword(
                                                                event.target.value,
                                                            )
                                                        }
                                                        required
                                                        type="password"
                                                        value={confirmPassword}
                                                    />
                                                </div>

                                                <div className="flex md:col-span-2">
                                                    <button
                                                        className="h-11 cursor-pointer rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                                                        disabled={isChangingPassword}
                                                        type="submit"
                                                    >
                                                        {isChangingPassword
                                                            ? "Updating..."
                                                            : "Update password"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </section>

                                    <section className="rounded-lg border border-red-100 bg-red-50/40 p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex gap-3">
                                                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 ring-1 ring-red-200">
                                                    <LockKeyhole
                                                        aria-hidden="true"
                                                        size={20}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-zinc-950">
                                                        Session
                                                    </h3>
                                                    <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-600">
                                                        You are currently signed in on this
                                                        device.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                                                disabled={isLoggingOut}
                                                onClick={handleLogout}
                                                type="button"
                                            >
                                                <LogOut aria-hidden="true" size={16} />
                                                {isLoggingOut
                                                    ? "Logging out..."
                                                    : "Log out"}
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
