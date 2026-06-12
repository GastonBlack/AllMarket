import {
    AlertCircle,
    Boxes,
    ClipboardList,
    PackageSearch,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Tags,
    Users,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import Pagination from "@/components/ui/Pagination";
import type { PaginatedResponse } from "@/types";

import type { AdminSection } from "./admin.helpers";

const adminSections: Array<{
    icon: ComponentType<{ "aria-hidden": true; size: number }>;
    label: string;
    value: AdminSection;
}> = [
        { icon: Boxes, label: "Products", value: "products" },
        { icon: Tags, label: "Categories", value: "categories" },
        { icon: ClipboardList, label: "Orders", value: "orders" },
        { icon: Users, label: "Users", value: "users" },
    ];

export function SectionTabs({
    activeSection,
    onSectionChange,
}: {
    activeSection: AdminSection;
    onSectionChange: (section: AdminSection) => void;
}) {
    return (
        <div className="overflow-x-auto">
            <div className="mx-auto flex w-max gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm">
                {adminSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.value;

                    return (
                        <button
                            className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium ${isActive
                                ? "bg-black text-white"
                                : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                                }`}
                            key={section.value}
                            onClick={() => onSectionChange(section.value)}
                            type="button"
                        >
                            <Icon aria-hidden={true} size={16} />
                            {section.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function AdminPanel({
    action,
    children,
    subtitle,
    title,
}: {
    action?: ReactNode;
    children: ReactNode;
    subtitle: string;
    title: string;
}) {
    return (
        <section className="mx-auto mt-6 max-w-7xl overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-950">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
                </div>
                {action}
            </header>
            {children}
        </section>
    );
}

export function SectionState({
    error,
    isLoading,
    onRetry,
}: {
    error: string;
    isLoading: boolean;
    onRetry: () => void;
}) {
    if (isLoading) {
        return (
            <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-zinc-600">
                <RefreshCw aria-hidden={true} className="animate-spin" size={18} />
                Loading data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-72 items-center justify-center p-8 text-center">
                <div>
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200">
                        <AlertCircle aria-hidden={true} size={22} />
                    </div>
                    <p className="mt-4 text-sm font-medium text-zinc-950">
                        {error}
                    </p>
                    <button
                        className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
                        onClick={onRetry}
                        type="button"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

export function EmptyTableState({ label }: { label: string }) {
    return (
        <div className="flex min-h-56 items-center justify-center p-8 text-center text-sm text-zinc-600">
            <div>
                <PackageSearch
                    aria-hidden={true}
                    className="mx-auto mb-3 text-zinc-400"
                    size={28}
                />
                No {label} found.
            </div>
        </div>
    );
}

export function FilterPanel({
    children,
    onReset,
    onSubmit,
}: {
    children: ReactNode;
    onReset: () => void;
    onSubmit: React.SubmitEventHandler<HTMLFormElement>;
}) {
    return (
        <form
            className="border-b border-zinc-200 bg-white px-5 py-4"
            onSubmit={onSubmit}
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                    <SlidersHorizontal aria-hidden={true} size={17} />
                    Filters
                </div>
                <div className="flex gap-2">
                    <button
                        className="h-9 cursor-pointer rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                        onClick={onReset}
                        type="button"
                    >
                        Reset
                    </button>
                    <button
                        className="h-9 cursor-pointer rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        type="submit"
                    >
                        Apply
                    </button>
                </div>
            </div>
            {children}
        </form>
    );
}

export function FilterField({
    children,
    label,
}: {
    children: ReactNode;
    label: string;
}) {
    return (
        <label className="grid gap-1.5">
            <span className="text-xs font-medium text-zinc-600">{label}</span>
            {children}
        </label>
    );
}

export function SearchInput({
    defaultValue,
    label,
    name = "search",
    placeholder,
}: {
    defaultValue?: string;
    label: string;
    name?: string;
    placeholder: string;
}) {
    return (
        <label className="grid gap-1.5">
            <span className="text-xs font-medium text-zinc-600">{label}</span>
            <span className="relative">
                <Search
                    aria-hidden={true}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={16}
                />
                <input
                    className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                    defaultValue={defaultValue}
                    name={name}
                    placeholder={placeholder}
                    type="search"
                />
            </span>
        </label>
    );
}

export function NumberInput({
    defaultValue,
    label,
    name,
    placeholder,
}: {
    defaultValue?: string;
    label: string;
    name: string;
    placeholder: string;
}) {
    return (
        <label className="grid gap-1.5">
            <span className="text-xs font-medium text-zinc-600">{label}</span>
            <input
                className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                defaultValue={defaultValue}
                min="0"
                name={name}
                placeholder={placeholder}
                type="number"
            />
        </label>
    );
}

export function CheckboxInput({
    defaultChecked,
    label,
    name,
}: {
    defaultChecked: boolean;
    label: string;
    name: string;
}) {
    return (
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 self-end rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 transition hover:border-zinc-300 hover:bg-white">
            <input
                className="size-4 accent-zinc-950"
                defaultChecked={defaultChecked}
                name={name}
                type="checkbox"
                value="true"
            />
            {label}
        </label>
    );
}

export function AdminPagination({
    page,
    onPageChange,
}: {
    page: PaginatedResponse<unknown>;
    onPageChange: (page: number) => void;
}) {
    return (
        <div className="border-t border-zinc-100 px-5 pb-5">
            <Pagination
                hasNextPage={page.hasNextPage}
                hasPreviousPage={page.hasPreviousPage}
                onPageChange={onPageChange}
                page={page.page}
                totalPages={page.totalPages}
            />
        </div>
    );
}
