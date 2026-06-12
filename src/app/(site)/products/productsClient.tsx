"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer } from "react";

import ProductGrid from "@/components/products/ProductGrid";
import FilterSection from "@/components/ui/FilterSection";
import Pagination from "@/components/ui/Pagination";
import type {
    CategoryResponseDto,
    PaginatedResponse,
    ProductResponseDto,
    ProductSortBy,
} from "@/types";
import { scrollToId } from "@/utils/scrollToId";

interface ProductsClientProps {
    productPage: PaginatedResponse<ProductResponseDto>;
    initialCategories: CategoryResponseDto[];
}

interface ProductsFilterState {
    appliedMaxPrice: number | null;
    appliedMinPrice: number | null;
    debouncedSearch: string;
    maxPrice: string;
    minPrice: string;
    search: string;
    selectedCategoryId: number | null;
    sortBy: ProductSortBy;
}

type ProductsFilterAction =
    | { type: "applyPrice"; maxPrice: number | null; minPrice: number | null }
    | { type: "resetFilters" }
    | { type: "setCategory"; categoryId: number | null }
    | { type: "setDebouncedSearch"; search: string }
    | { type: "setMaxPrice"; value: string }
    | { type: "setMinPrice"; value: string }
    | { type: "setSearch"; value: string }
    | { type: "setSortBy"; sortBy: ProductSortBy }
    | { type: "syncFromUrl"; state: ProductsFilterState };

const productSortValues: ProductSortBy[] = [
    "popular",
    "newest",
    "price_asc",
    "price_desc",
    "name_asc",
    "name_desc",
];

const productSortOptions: Array<{
    label: string;
    value: ProductSortBy;
}> = [
    { label: "Popular", value: "popular" },
    { label: "Newest", value: "newest" },
    { label: "Price: low to high", value: "price_asc" },
    { label: "Price: high to low", value: "price_desc" },
    { label: "Name: A to Z", value: "name_asc" },
    { label: "Name: Z to A", value: "name_desc" },
];

const productsGridId = "products-grid";

function parseOptionalNumber(value: string | null) {
    if (!value) {
        return null;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null;
}

function parseProductSortBy(value: string | null) {
    if (!value) {
        return "popular";
    }

    return productSortValues.includes(value as ProductSortBy)
        ? (value as ProductSortBy)
        : "popular";
}

function getInitialFilterState(params: URLSearchParams): ProductsFilterState {
    const search = params.get("search") ?? "";
    const minPrice = params.get("minPrice") ?? "";
    const maxPrice = params.get("maxPrice") ?? "";

    return {
        appliedMaxPrice: parseOptionalNumber(maxPrice),
        appliedMinPrice: parseOptionalNumber(minPrice),
        debouncedSearch: search,
        maxPrice,
        minPrice,
        search,
        selectedCategoryId: parseOptionalNumber(
            params.get("categoryId") ?? params.get("category"),
        ),
        sortBy: parseProductSortBy(params.get("sortBy")),
    };
}

function productsFilterReducer(
    state: ProductsFilterState,
    action: ProductsFilterAction,
): ProductsFilterState {
    switch (action.type) {
        case "applyPrice":
            return {
                ...state,
                appliedMaxPrice: action.maxPrice,
                appliedMinPrice: action.minPrice,
                maxPrice: action.maxPrice === null ? "" : String(action.maxPrice),
                minPrice: action.minPrice === null ? "" : String(action.minPrice),
            };
        case "resetFilters":
            return {
                ...state,
                appliedMaxPrice: null,
                appliedMinPrice: null,
                debouncedSearch: "",
                maxPrice: "",
                minPrice: "",
                search: "",
                selectedCategoryId: null,
                sortBy: "popular",
            };
        case "setCategory":
            return {
                ...state,
                selectedCategoryId: action.categoryId,
            };
        case "setDebouncedSearch":
            return {
                ...state,
                debouncedSearch: action.search,
            };
        case "setMaxPrice":
            return {
                ...state,
                maxPrice: action.value,
            };
        case "setMinPrice":
            return {
                ...state,
                minPrice: action.value,
            };
        case "setSearch":
            return {
                ...state,
                search: action.value,
            };
        case "setSortBy":
            return {
                ...state,
                sortBy: action.sortBy,
            };
        case "syncFromUrl":
            return action.state;
    }
}

export default function ProductsClient({
    productPage,
    initialCategories,
}: ProductsClientProps) {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchParamsString = searchParams.toString();
    const [filterState, dispatch] = useReducer(
        productsFilterReducer,
        searchParamsString,
        (initialSearchParamsString) =>
            getInitialFilterState(new URLSearchParams(initialSearchParamsString)),
    );

    function updateUrlParams(
        updates: Record<string, string | null>,
        options: { resetPage?: boolean } = {},
    ) {
        const params = new URLSearchParams(searchParamsString);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value.trim() === "") {
                params.delete(key);
                return;
            }

            params.set(key, value);
        });

        if (options.resetPage) {
            params.delete("page");
        }

        const queryString = params.toString();
        replace(queryString ? `${pathname}?${queryString}` : pathname, {
            scroll: false,
        });
        scrollToId(productsGridId);
    }

    useEffect(() => {
        dispatch({
            state: getInitialFilterState(new URLSearchParams(searchParamsString)),
            type: "syncFromUrl",
        });
    }, [searchParamsString]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            dispatch({
                search: filterState.search,
                type: "setDebouncedSearch",
            });
        }, 400);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [filterState.search]);

    useEffect(() => {
        const normalizedSearch = filterState.debouncedSearch.trim();
        const params = new URLSearchParams(searchParamsString);
        const currentSearch = params.get("search") ?? "";

        if (currentSearch === normalizedSearch) {
            return;
        }

        if (normalizedSearch) {
            params.set("search", normalizedSearch);
        } else {
            params.delete("search");
        }

        params.delete("page");

        const queryString = params.toString();
        replace(queryString ? `${pathname}?${queryString}` : pathname, {
            scroll: false,
        });
        scrollToId(productsGridId);
    }, [filterState.debouncedSearch, pathname, replace, searchParamsString]);

    const handleCategoryChange = (categoryId: number | null) => {
        dispatch({
            categoryId,
            type: "setCategory",
        });
        updateUrlParams({
            category: null,
            categoryId: categoryId === null ? null : String(categoryId),
        }, { resetPage: true });
    };

    const handleApplyPriceFilter = () => {
        const parsedMinPrice = parseOptionalNumber(filterState.minPrice);
        const parsedMaxPrice = parseOptionalNumber(filterState.maxPrice);
        const hasInvalidRange =
            parsedMinPrice !== null &&
            parsedMaxPrice !== null &&
            parsedMinPrice > parsedMaxPrice;
        const nextMinPrice = hasInvalidRange ? parsedMaxPrice : parsedMinPrice;
        const nextMaxPrice = hasInvalidRange ? parsedMinPrice : parsedMaxPrice;

        dispatch({
            maxPrice: nextMaxPrice,
            minPrice: nextMinPrice,
            type: "applyPrice",
        });
        updateUrlParams({
            maxPrice: nextMaxPrice === null ? null : String(nextMaxPrice),
            minPrice: nextMinPrice === null ? null : String(nextMinPrice),
        }, { resetPage: true });
    };

    const hasActiveFilters =
        filterState.selectedCategoryId !== null ||
        filterState.appliedMinPrice !== null ||
        filterState.appliedMaxPrice !== null ||
        filterState.minPrice.trim() !== "" ||
        filterState.maxPrice.trim() !== "" ||
        filterState.search.trim() !== "" ||
        filterState.sortBy !== "popular";

    const handleResetFilters = () => {
        dispatch({
            type: "resetFilters",
        });
        updateUrlParams({
            category: null,
            categoryId: null,
            maxPrice: null,
            minPrice: null,
            search: null,
            sortBy: null,
        }, { resetPage: true });
    };

    const handleSortByChange = (sortBy: ProductSortBy) => {
        dispatch({
            sortBy,
            type: "setSortBy",
        });
        updateUrlParams({
            sortBy: sortBy === "popular" ? null : sortBy,
        }, { resetPage: true });
    };

    const handlePageChange = (page: number) => {
        updateUrlParams({
            page: String(page),
        });
    };

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid w-full items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <FilterSection
                    categories={initialCategories}
                    productCount={productPage.totalItems}
                    minPrice={filterState.minPrice}
                    maxPrice={filterState.maxPrice}
                    hasActiveFilters={hasActiveFilters}
                    selectedCategoryId={filterState.selectedCategoryId}
                    onMinPriceChange={(value) =>
                        dispatch({
                            type: "setMinPrice",
                            value,
                        })
                    }
                    onMaxPriceChange={(value) =>
                        dispatch({
                            type: "setMaxPrice",
                            value,
                        })
                    }
                    onCategoryChange={handleCategoryChange}
                    onApplyPriceFilter={handleApplyPriceFilter}
                    onResetFilters={handleResetFilters}
                />
                <section className="min-w-0 scroll-mt-24" id={productsGridId}>
                    <div className="mb-5 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px]">
                        <div>
                            <label
                                className="text-sm font-medium text-zinc-800"
                                htmlFor="product-search"
                            >
                                Search products
                            </label>
                            <div className="relative mt-2">
                                <Search
                                    aria-hidden="true"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                                    size={18}
                                />
                                <input
                                    aria-label="Search products"
                                    className="h-11 w-full rounded-md border border-zinc-300 bg-white pl-10 pr-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                    id="product-search"
                                    onChange={(event) =>
                                        dispatch({
                                            type: "setSearch",
                                            value: event.target.value,
                                        })
                                    }
                                    placeholder="Search by name, description, or category"
                                    type="search"
                                    value={filterState.search}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium text-zinc-800"
                                htmlFor="product-sort"
                            >
                                Sort by
                            </label>
                            <select
                                aria-label="Sort products"
                                className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                id="product-sort"
                                onChange={(event) =>
                                    handleSortByChange(
                                        parseProductSortBy(event.target.value),
                                    )
                                }
                                value={filterState.sortBy}
                            >
                                {productSortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <ProductGrid products={productPage.items} />
                    <Pagination
                        page={productPage.page}
                        totalPages={productPage.totalPages}
                        hasNextPage={productPage.hasNextPage}
                        hasPreviousPage={productPage.hasPreviousPage}
                        onPageChange={handlePageChange}
                    />
                </section>
            </div>
        </main>
    );
}
