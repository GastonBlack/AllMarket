import { Power, PowerOff } from "lucide-react";

import type { AdminUserResponseDto, PaginatedResponse } from "@/types";
import { formatDate } from "@/utils/formatters";

import {
    AdminPagination,
    AdminPanel,
    CheckboxInput,
    EmptyTableState,
    FilterPanel,
    NumberInput,
    SearchInput,
    SectionState,
} from "../adminShared";

interface UsersSectionProps {
    error: string;
    isLoading: boolean;
    onFilterSubmit: React.SubmitEventHandler<HTMLFormElement>;
    onGoToOrders: (user: AdminUserResponseDto) => void;
    onPageChange: (page: number) => void;
    onReset: () => void;
    onRetry: () => void;
    onToggleUser: (user: AdminUserResponseDto) => void;
    page: PaginatedResponse<AdminUserResponseDto> | null;
    params: URLSearchParams;
    updatingUserId: number | null;
}

export default function UsersSection({
    error,
    isLoading,
    onFilterSubmit,
    onGoToOrders,
    onPageChange,
    onReset,
    onRetry,
    onToggleUser,
    page,
    params,
    updatingUserId,
}: UsersSectionProps) {
    return (
        <AdminPanel
            subtitle={
                page
                    ? `Page ${page.page} of ${page.totalPages || 1} - ${page.totalItems} results`
                    : "Customer accounts"
            }
            title="Users"
        >
            <FilterPanel
                key={`users-${params.toString()}`}
                onSubmit={onFilterSubmit}
                onReset={onReset}
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SearchInput
                        defaultValue={params.get("search") ?? ""}
                        label="User"
                        placeholder="ID, name, email, or phone"
                    />
                    <SearchInput
                        defaultValue={params.get("fullName") ?? ""}
                        label="Full name"
                        name="fullName"
                        placeholder="Name"
                    />
                    <SearchInput
                        defaultValue={params.get("email") ?? ""}
                        label="Email"
                        name="email"
                        placeholder="Email"
                    />
                    <SearchInput
                        defaultValue={params.get("phone") ?? ""}
                        label="Phone"
                        name="phone"
                        placeholder="Phone"
                    />
                    <NumberInput
                        defaultValue={params.get("userId") ?? ""}
                        label="Exact user ID"
                        name="userId"
                        placeholder="ID"
                    />
                    <CheckboxInput
                        defaultChecked={
                            params.get("includeDisabled") === "true"
                        }
                        label="Include disabled users"
                        name="includeDisabled"
                    />
                </div>
            </FilterPanel>

            {!page || error ? (
                <SectionState error={error} isLoading={isLoading} onRetry={onRetry} />
            ) : page.items.length === 0 ? (
                <EmptyTableState label="users" />
            ) : (
                <>
                    <div className="grid gap-3 p-4 md:hidden">
                        {page.items.map((user) => (
                            <article
                                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                                key={user.id}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs text-zinc-500">User #{user.id}</p>
                                        <button
                                            className="mt-1 text-left text-lg font-semibold text-zinc-950"
                                            onClick={() => onGoToOrders(user)}
                                            type="button"
                                        >
                                            {user.fullName}
                                        </button>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                            user.isActive
                                                ? "bg-green-50 text-green-700 ring-green-200"
                                                : "bg-zinc-100 text-zinc-600 ring-zinc-200"
                                        }`}
                                    >
                                        {user.isActive ? "Active" : "Disabled"}
                                    </span>
                                </div>
                                <dl className="mt-4 grid gap-3 rounded-md bg-zinc-50 p-3 text-sm">
                                    <div>
                                        <dt className="text-xs text-zinc-500">Email</dt>
                                        <dd className="mt-1 break-all">{user.email}</dd>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <dt className="text-xs text-zinc-500">Phone</dt>
                                            <dd className="mt-1">{user.phone ?? "-"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-zinc-500">Created</dt>
                                            <dd className="mt-1">{formatDate(user.createdAt)}</dd>
                                        </div>
                                    </div>
                                </dl>
                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                            user.rol === "Admin"
                                                ? "bg-black text-white ring-black"
                                                : "bg-zinc-100 text-zinc-700 ring-zinc-200"
                                        }`}
                                    >
                                        {user.rol}
                                    </span>
                                    {user.rol === "Admin" ? (
                                        <span className="text-xs text-zinc-400">Protected</span>
                                    ) : (
                                        <button
                                            className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium disabled:opacity-60 ${
                                                user.isActive
                                                    ? "border-red-200 text-red-600"
                                                    : "border-green-200 text-green-700"
                                            }`}
                                            disabled={updatingUserId === user.id}
                                            onClick={() => onToggleUser(user)}
                                            type="button"
                                        >
                                            {user.isActive ? (
                                                <PowerOff aria-hidden={true} size={15} />
                                            ) : (
                                                <Power aria-hidden={true} size={15} />
                                            )}
                                            {user.isActive ? "Disable" : "Enable"}
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[980px] text-left text-sm">
                            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">User</th>
                                    <th className="px-5 py-4 font-semibold">Email</th>
                                    <th className="px-5 py-4 font-semibold">Phone</th>
                                    <th className="px-5 py-4 font-semibold">Role</th>
                                    <th className="px-5 py-4 font-semibold">
                                        Created
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {page.items.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-5 py-4">
                                            <button
                                                className="text-left font-semibold text-zinc-950 underline-offset-2 hover:underline"
                                                onClick={() => onGoToOrders(user)}
                                                type="button"
                                            >
                                                {user.fullName}
                                            </button>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                ID: {user.id}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">{user.email}</td>
                                        <td className="px-5 py-4">
                                            {user.phone ?? "-"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                                    user.rol === "Admin"
                                                        ? "bg-black text-white ring-black"
                                                        : "bg-zinc-100 text-zinc-700 ring-zinc-200"
                                                }`}
                                            >
                                                {user.rol}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                                    user.isActive
                                                        ? "bg-green-50 text-green-700 ring-green-200"
                                                        : "bg-zinc-100 text-zinc-600 ring-zinc-200"
                                                }`}
                                            >
                                                {user.isActive
                                                    ? "Active"
                                                    : "Disabled"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {user.rol === "Admin" ? (
                                                <span className="text-xs text-zinc-400">
                                                    Protected
                                                </span>
                                            ) : (
                                                <button
                                                    className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        user.isActive
                                                            ? "border-red-200 text-red-600 hover:bg-red-50"
                                                            : "border-green-200 text-green-700 hover:bg-green-50"
                                                    }`}
                                                    disabled={
                                                        updatingUserId === user.id
                                                    }
                                                    onClick={() =>
                                                        onToggleUser(user)
                                                    }
                                                    type="button"
                                                >
                                                    {user.isActive ? (
                                                        <PowerOff
                                                            aria-hidden={true}
                                                            size={15}
                                                        />
                                                    ) : (
                                                        <Power
                                                            aria-hidden={true}
                                                            size={15}
                                                        />
                                                    )}
                                                    {user.isActive
                                                        ? "Disable"
                                                        : "Enable"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <AdminPagination onPageChange={onPageChange} page={page} />
                </>
            )}
        </AdminPanel>
    );
}
