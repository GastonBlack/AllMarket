import { Pencil, Plus, Power, PowerOff } from "lucide-react";
import Image from "next/image";

import type {
    AdminCategoryResponseDto,
    AdminProductResponseDto,
    PaginatedResponse,
} from "@/types";
import { formatPrice } from "@/utils/formatters";

import { getAdminProductDisplayPrice, productSortOptions } from "../admin.helpers";
import {
    AdminPagination,
    AdminPanel,
    EmptyTableState,
    FilterField,
    FilterPanel,
    NumberInput,
    SearchInput,
    SectionState,
} from "../adminShared";

interface ProductsSectionProps {
    categories: AdminCategoryResponseDto[];
    error: string;
    isLoading: boolean;
    onFilterSubmit: React.SubmitEventHandler<HTMLFormElement>;
    onCreateProduct: () => void;
    onEditProduct: (product: AdminProductResponseDto) => void;
    onPageChange: (page: number) => void;
    onReset: () => void;
    onRetry: () => void;
    onToggleProduct: (product: AdminProductResponseDto) => void;
    page: PaginatedResponse<AdminProductResponseDto> | null;
    params: URLSearchParams;
    updatingProductId: number | null;
}

export default function ProductsSection({
    categories,
    error,
    isLoading,
    onFilterSubmit,
    onCreateProduct,
    onEditProduct,
    onPageChange,
    onReset,
    onRetry,
    onToggleProduct,
    page,
    params,
    updatingProductId,
}: ProductsSectionProps) {
    const hasAdvancedFilters = [
        "minStock",
        "maxStock",
        "minReservedStock",
        "maxReservedStock",
        "minPrice",
        "maxPrice",
    ].some((key) => params.has(key));

    return (
        <AdminPanel
            action={
                <button
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:h-9 sm:w-auto"
                    onClick={onCreateProduct}
                    type="button"
                >
                    <Plus aria-hidden={true} size={17} />
                    New product
                </button>
            }
            subtitle={
                page
                    ? `Page ${page.page} of ${page.totalPages || 1} - ${page.totalItems} results`
                    : "Products inventory"
            }
            title="Products"
        >
            <FilterPanel
                key={`products-${params.toString()}`}
                onSubmit={onFilterSubmit}
                onReset={onReset}
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SearchInput
                        defaultValue={params.get("search") ?? ""}
                        label="Product"
                        placeholder="ID or name"
                    />
                    <FilterField label="Category">
                        <select
                            className="h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                            defaultValue={params.get("categoryId") ?? ""}
                            name="categoryId"
                        >
                            <option value="">All categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </FilterField>
                    <FilterField label="Discount">
                        <select
                            className="h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                            defaultValue={params.get("discount") ?? ""}
                            name="discount"
                        >
                            <option value="">All products</option>
                            <option value="true">With discount</option>
                            <option value="false">Without discount</option>
                        </select>
                    </FilterField>
                    <FilterField label="Status">
                        <select
                            className="h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                            defaultValue={params.get("status") ?? "active"}
                            name="status"
                        >
                            <option value="active">Active products</option>
                            <option value="disabled">Disabled products</option>
                            <option value="all">All products</option>
                        </select>
                    </FilterField>
                    <FilterField label="Sort by">
                        <select
                            className="h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                            defaultValue={params.get("sortBy") ?? ""}
                            name="sortBy"
                        >
                            <option value="">Default sorting</option>
                            {productSortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </FilterField>
                </div>

                <details
                    className="mt-3 rounded-md border border-zinc-200 bg-zinc-50"
                    open={hasAdvancedFilters || undefined}
                >
                    <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-zinc-700">
                        Advanced filters
                    </summary>
                    <div className="grid gap-3 border-t border-zinc-200 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <NumberInput
                            defaultValue={params.get("minStock") ?? ""}
                            label="Minimum stock"
                            name="minStock"
                            placeholder="0"
                        />
                        <NumberInput
                            defaultValue={params.get("maxStock") ?? ""}
                            label="Maximum stock"
                            name="maxStock"
                            placeholder="Any"
                        />
                        <NumberInput
                            defaultValue={
                                params.get("minReservedStock") ?? ""
                            }
                            label="Minimum reserved"
                            name="minReservedStock"
                            placeholder="0"
                        />
                        <NumberInput
                            defaultValue={
                                params.get("maxReservedStock") ?? ""
                            }
                            label="Maximum reserved"
                            name="maxReservedStock"
                            placeholder="Any"
                        />
                        <NumberInput
                            defaultValue={params.get("minPrice") ?? ""}
                            label="Minimum price"
                            name="minPrice"
                            placeholder="0"
                        />
                        <NumberInput
                            defaultValue={params.get("maxPrice") ?? ""}
                            label="Maximum price"
                            name="maxPrice"
                            placeholder="Any"
                        />
                    </div>
                </details>
            </FilterPanel>

            {!page || error ? (
                <SectionState error={error} isLoading={isLoading} onRetry={onRetry} />
            ) : page.items.length === 0 ? (
                <EmptyTableState label="products" />
            ) : (
                <>
                    <div className="grid gap-3 p-4 md:hidden">
                        {page.items.map((product) => (
                            <article
                                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                                key={product.id}
                            >
                                <div className="flex gap-3">
                                    <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-zinc-100 bg-zinc-50">
                                        {product.imageUrl ? (
                                            <Image
                                                alt={product.name}
                                                className="object-contain p-2"
                                                fill
                                                sizes="80px"
                                                src={product.imageUrl}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-zinc-400">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-xs text-zinc-500">
                                                    #{product.id} · {product.categoryName}
                                                </p>
                                                <h3 className="mt-1 line-clamp-2 font-semibold text-zinc-950">
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                                    product.isActive
                                                        ? "bg-green-50 text-green-700 ring-green-200"
                                                        : "bg-zinc-100 text-zinc-600 ring-zinc-200"
                                                }`}
                                            >
                                                {product.isActive ? "Active" : "Disabled"}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-lg font-semibold text-zinc-950">
                                            {formatPrice(
                                                getAdminProductDisplayPrice(product),
                                            )}
                                            {product.hasDiscount && (
                                                <span className="ml-2 text-xs font-semibold text-red-600">
                                                    Discount
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <dl className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-zinc-50 p-3 text-sm">
                                    <div>
                                        <dt className="text-xs text-zinc-500">Stock</dt>
                                        <dd className="mt-1 font-semibold">{product.stock}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-zinc-500">Available</dt>
                                        <dd className="mt-1 font-semibold">{product.availableStock}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-zinc-500">Reserved</dt>
                                        <dd className="mt-1 font-semibold">{product.reservedStock}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-zinc-500">Sold</dt>
                                        <dd className="mt-1 font-semibold">{product.totalSold}</dd>
                                    </div>
                                </dl>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 text-sm font-medium text-zinc-700"
                                        onClick={() => onEditProduct(product)}
                                        type="button"
                                    >
                                        <Pencil aria-hidden={true} size={15} />
                                        Edit
                                    </button>
                                    <button
                                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium disabled:opacity-60 ${
                                            product.isActive
                                                ? "border-red-200 text-red-600"
                                                : "border-green-200 text-green-700"
                                        }`}
                                        disabled={updatingProductId === product.id}
                                        onClick={() => onToggleProduct(product)}
                                        type="button"
                                    >
                                        {product.isActive ? (
                                            <PowerOff aria-hidden={true} size={15} />
                                        ) : (
                                            <Power aria-hidden={true} size={15} />
                                        )}
                                        {product.isActive ? "Disable" : "Enable"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[1050px] table-fixed text-left text-sm">
                            <colgroup>
                                <col className="w-[5%]" />
                                <col className="w-[31%]" />
                                <col className="w-[12%]" />
                                <col className="w-[8%]" />
                                <col className="w-[7%]" />
                                <col className="w-[8%]" />
                                <col className="w-[8%]" />
                                <col className="w-[6%]" />
                                <col className="w-[7%]" />
                                <col className="w-[8%]" />
                            </colgroup>
                            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                                <tr>
                                    <th className="px-3 py-4 font-semibold">Id</th>
                                    <th className="px-3 py-4 font-semibold">
                                        Product
                                    </th>
                                    <th className="px-3 py-4 font-semibold">
                                        Category
                                    </th>
                                    <th className="px-3 py-4 font-semibold">
                                        Price
                                    </th>
                                    <th className="px-3 py-4 font-semibold">
                                        Stock
                                    </th>
                                    <th className="px-3 py-4 font-semibold">
                                        Reserved
                                    </th>
                                    <th className="px-3 py-4 font-semibold">
                                        Available
                                    </th>
                                    <th className="px-3 py-4 font-semibold">Sold</th>
                                    <th className="px-3 py-4 font-semibold">
                                        Status
                                    </th>
                                    <th className="px-3 py-4 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {page.items.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-3 py-4 text-zinc-700">
                                            {product.id}
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-zinc-50">
                                                    {product.imageUrl ? (
                                                        <Image
                                                            alt={product.name}
                                                            className="object-contain p-1"
                                                            fill
                                                            sizes="48px"
                                                            src={product.imageUrl}
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                                                            No image
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-zinc-950">
                                                        {product.name}
                                                    </p>
                                                    <p className="truncate text-xs text-zinc-500">
                                                        {product.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="truncate px-3 py-4">
                                            {product.categoryName}
                                        </td>
                                        <td className="px-3 py-4 align-middle">
                                            <div className="flex items-center gap-1">
                                                {formatPrice(
                                                    getAdminProductDisplayPrice(product),
                                                )}
                                                {product.hasDiscount ? (
                                                    <div className="h-2 w-2 rounded-xl bg-red-500"/>
                                                ) : ""}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">{product.stock}</td>
                                        <td className="px-3 py-4">
                                            {product.reservedStock}
                                        </td>
                                        <td className="px-3 py-4">
                                            {product.availableStock}
                                        </td>
                                        <td className="px-3 py-4">
                                            {product.totalSold}
                                        </td>
                                        <td className="px-3 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${product.isActive
                                                        ? "bg-green-50 text-green-700 ring-green-200"
                                                        : "bg-zinc-100 text-zinc-600 ring-zinc-200"
                                                    }`}
                                            >
                                                {product.isActive
                                                    ? "Active"
                                                    : "Disabled"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    aria-label={`Edit ${product.name}`}
                                                    className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                                                    onClick={() =>
                                                        onEditProduct(product)
                                                    }
                                                    type="button"
                                                >
                                                    <Pencil
                                                        aria-hidden={true}
                                                        size={15}
                                                    />
                                                </button>
                                                <button
                                                    aria-label={`${product.isActive ? "Disable" : "Enable"} ${product.name}`}
                                                    className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-60 ${product.isActive
                                                            ? "border-red-200 text-red-600 hover:bg-red-50"
                                                            : "border-green-200 text-green-700 hover:bg-green-50"
                                                        }`}
                                                    disabled={
                                                        updatingProductId ===
                                                        product.id
                                                    }
                                                    onClick={() =>
                                                        onToggleProduct(product)
                                                    }
                                                    type="button"
                                                >
                                                    {product.isActive ? (
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
