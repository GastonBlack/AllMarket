import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import type { AdminCategoryResponseDto, PaginatedResponse } from "@/types";

import {
    AdminPagination,
    AdminPanel,
    CheckboxInput,
    EmptyTableState,
    FilterPanel,
    SearchInput,
    SectionState,
} from "./adminShared";

interface CategoriesSectionProps {
    error: string;
    isLoading: boolean;
    mutationError: string;
    onCreateCategory: () => void;
    onDeleteCategory: (category: AdminCategoryResponseDto) => void;
    onEditCategory: (category: AdminCategoryResponseDto) => void;
    onFilterSubmit: React.SubmitEventHandler<HTMLFormElement>;
    onPageChange: (page: number) => void;
    onReset: () => void;
    onRetry: () => void;
    page: PaginatedResponse<AdminCategoryResponseDto> | null;
    params: URLSearchParams;
    deletingCategoryId: number | null;
}

export function CategoryFormModal({
    category,
    error,
    isSubmitting,
    onClose,
    onSubmit,
}: {
    category: AdminCategoryResponseDto | null;
    error: string;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
}) {
    const [name, setName] = useState(category?.name ?? "");

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(name.trim());
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
        >
            <form
                aria-labelledby="category-form-title"
                aria-modal="true"
                className="w-full max-w-md rounded-lg bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                onSubmit={handleSubmit}
                role="dialog"
            >
                <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                    <h2
                        className="text-lg font-semibold text-zinc-950"
                        id="category-form-title"
                    >
                        {category ? "Edit category" : "New category"}
                    </h2>
                    <button
                        aria-label="Close category form"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                        onClick={onClose}
                        type="button"
                    >
                        <X aria-hidden={true} size={19} />
                    </button>
                </header>
                <div className="p-5">
                    <label className="grid gap-2 text-sm font-medium text-zinc-700">
                        Name
                        <input
                            autoFocus
                            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
                            maxLength={60}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Category name"
                            required
                            value={name}
                        />
                    </label>
                    {error && (
                        <p
                            className="mt-3 text-sm font-medium text-red-700"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                </div>
                <footer className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-4">
                    <button
                        className="h-9 cursor-pointer rounded-md border border-zinc-200 px-4 text-sm font-medium text-zinc-700"
                        onClick={onClose}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSubmitting || !name.trim()}
                        type="submit"
                    >
                        {isSubmitting && (
                            <LoaderCircle
                                aria-hidden={true}
                                className="animate-spin"
                                size={16}
                            />
                        )}
                        {category ? "Save changes" : "Create category"}
                    </button>
                </footer>
            </form>
        </div>
    );
}

export default function CategoriesSection({
    deletingCategoryId,
    error,
    isLoading,
    mutationError,
    onCreateCategory,
    onDeleteCategory,
    onEditCategory,
    onFilterSubmit,
    onPageChange,
    onReset,
    onRetry,
    page,
    params,
}: CategoriesSectionProps) {
    return (
        <AdminPanel
            action={
                <button
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    onClick={onCreateCategory}
                    type="button"
                >
                    <Plus aria-hidden={true} size={17} />
                    New category
                </button>
            }
            subtitle={
                page
                    ? `Page ${page.page} of ${page.totalPages || 1} - ${page.totalItems} results`
                    : "Product categories"
            }
            title="Categories"
        >
            <FilterPanel
                key={`categories-${params.toString()}`}
                onSubmit={onFilterSubmit}
                onReset={onReset}
            >
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                    <SearchInput
                        defaultValue={params.get("search") ?? ""}
                        label="Category"
                        placeholder="ID or name"
                    />
                    <CheckboxInput
                        defaultChecked={
                            params.get("onlyWithoutProducts") === "true"
                        }
                        label="Only without products"
                        name="onlyWithoutProducts"
                    />
                </div>
            </FilterPanel>

            {mutationError && (
                <p
                    className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-700"
                    role="alert"
                >
                    {mutationError}
                </p>
            )}

            {!page || error ? (
                <SectionState error={error} isLoading={isLoading} onRetry={onRetry} />
            ) : page.items.length === 0 ? (
                <EmptyTableState label="categories" />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Id</th>
                                    <th className="px-5 py-4 font-semibold">
                                        Category
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Products
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
                                {page.items.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-5 py-4 text-zinc-700">
                                            {category.id}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-zinc-950">
                                            {category.name}
                                        </td>
                                        <td className="px-5 py-4">
                                            {category.productCount}
                                        </td>
                                        <td className="px-5 py-4">
                                            {category.productCount > 0
                                                ? "Has products"
                                                : "Empty"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    aria-label={`Edit ${category.name}`}
                                                    className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                                                    onClick={() =>
                                                        onEditCategory(category)
                                                    }
                                                    type="button"
                                                >
                                                    <Pencil
                                                        aria-hidden={true}
                                                        size={15}
                                                    />
                                                </button>
                                                <button
                                                    aria-label={`Delete ${category.name}`}
                                                    className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-300"
                                                    disabled={
                                                        category.productCount >
                                                            0 ||
                                                        deletingCategoryId ===
                                                            category.id
                                                    }
                                                    onClick={() =>
                                                        onDeleteCategory(
                                                            category,
                                                        )
                                                    }
                                                    title={
                                                        category.productCount > 0
                                                            ? "Move or delete its products first"
                                                            : "Delete category"
                                                    }
                                                    type="button"
                                                >
                                                    {deletingCategoryId ===
                                                    category.id ? (
                                                        <LoaderCircle
                                                            aria-hidden={true}
                                                            className="animate-spin"
                                                            size={15}
                                                        />
                                                    ) : (
                                                        <Trash2
                                                            aria-hidden={true}
                                                            size={15}
                                                        />
                                                    )}
                                                </button>
                                            </div>
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
