import { getApiError } from "@/lib/axios";
import type {
    AdminCategoryQueryParams,
    AdminOrderQueryParams,
    AdminProductQueryParams,
    AdminProductResponseDto,
    AdminProductSortBy,
    AdminProductStatus,
    AdminUserQueryParams,
    OrderStatus,
} from "@/types";

export type AdminSection = "products" | "categories" | "orders" | "users";

export const pageSize = 10;

export const productSortOptions: Array<{
    label: string;
    value: AdminProductSortBy;
}> = [
    { label: "Stock: low to high", value: "stock_asc" },
    { label: "Stock: high to low", value: "stock_desc" },
    { label: "Reserved: low to high", value: "reserved_asc" },
    { label: "Reserved: high to low", value: "reserved_desc" },
    { label: "Available: low to high", value: "available_asc" },
    { label: "Available: high to low", value: "available_desc" },
    { label: "Most sold", value: "sold_desc" },
    { label: "Price: low to high", value: "price_asc" },
    { label: "Price: high to low", value: "price_desc" },
    { label: "Name: A to Z", value: "name_asc" },
    { label: "Name: Z to A", value: "name_desc" },
];

export const orderStatusOptions: OrderStatus[] = [
    "Awaiting for payment",
    "Paid",
    "Preparing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Expired",
    "Refunding",
    "Refunded",
];

export function getNextOrderStatuses(status: OrderStatus): OrderStatus[] {
    switch (status) {
        case "Awaiting for payment":
            return ["Paid", "Cancelled", "Expired"];
        case "Paid":
            return ["Preparing"];
        case "Preparing":
            return ["Shipped"];
        case "Shipped":
            return ["Delivered"];
        default:
            return [];
    }
}

const adminSections: AdminSection[] = [
    "products",
    "categories",
    "orders",
    "users",
];

const productSortValues = productSortOptions.map((option) => option.value);
const productStatusValues: AdminProductStatus[] = [
    "active",
    "disabled",
    "all",
];

export function parseAdminSection(value: string | null): AdminSection {
    return adminSections.includes(value as AdminSection)
        ? (value as AdminSection)
        : "products";
}

function getStringParam(params: URLSearchParams, key: string) {
    const value = params.get(key)?.trim();

    return value ? value : undefined;
}

function getNumberParam(params: URLSearchParams, key: string) {
    const value = getStringParam(params, key);

    if (!value) {
        return undefined;
    }

    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getBooleanParam(params: URLSearchParams, key: string) {
    return params.get(key) === "true" ? true : undefined;
}

function getPageParam(params: URLSearchParams) {
    const page = getNumberParam(params, "page");

    return page && page > 0 ? page : 1;
}

function getProductSortParam(params: URLSearchParams) {
    const sortBy = getStringParam(params, "sortBy");

    return sortBy && productSortValues.includes(sortBy as AdminProductSortBy)
        ? (sortBy as AdminProductSortBy)
        : undefined;
}

function getProductStatusParam(params: URLSearchParams): AdminProductStatus {
    const status = getStringParam(params, "status");

    return productStatusValues.includes(status as AdminProductStatus)
        ? (status as AdminProductStatus)
        : "active";
}

function getOrderStatusParam(params: URLSearchParams) {
    const status = getStringParam(params, "status");

    return status && orderStatusOptions.includes(status as OrderStatus)
        ? (status as OrderStatus)
        : undefined;
}

function getUtcDateBoundary(
    params: URLSearchParams,
    key: "fromDate" | "toDate",
) {
    const date = getStringParam(params, key);

    if (!date) {
        return undefined;
    }

    return key === "fromDate"
        ? `${date}T00:00:00.000Z`
        : `${date}T23:59:59.999Z`;
}

function assignNumberParam<T extends object, K extends keyof T & string>(
    query: T,
    params: URLSearchParams,
    key: K,
) {
    const value = getNumberParam(params, key);

    if (value !== undefined) {
        (query as Record<K, number>)[key] = value;
    }
}

function assignStringParam<T extends object, K extends keyof T & string>(
    query: T,
    params: URLSearchParams,
    key: K,
) {
    const value = getStringParam(params, key);

    if (value) {
        (query as Record<K, string>)[key] = value;
    }
}

export function buildProductQuery(
    params: URLSearchParams,
): AdminProductQueryParams {
    const query: AdminProductQueryParams = {
        page: getPageParam(params),
        pageSize,
        status: getProductStatusParam(params),
    };
    const sortBy = getProductSortParam(params);

    assignStringParam(query, params, "search");
    assignNumberParam(query, params, "categoryId");
    assignNumberParam(query, params, "minStock");
    assignNumberParam(query, params, "maxStock");
    assignNumberParam(query, params, "minReservedStock");
    assignNumberParam(query, params, "maxReservedStock");
    assignNumberParam(query, params, "minPrice");
    assignNumberParam(query, params, "maxPrice");

    if (sortBy) {
        query.sortBy = sortBy;
    }

    return query;
}

export function buildCategoryQuery(
    params: URLSearchParams,
): AdminCategoryQueryParams {
    const query: AdminCategoryQueryParams = {
        page: getPageParam(params),
        pageSize,
    };

    assignStringParam(query, params, "search");

    if (getBooleanParam(params, "onlyWithoutProducts")) {
        query.onlyWithoutProducts = true;
    }

    return query;
}

export function buildOrderQuery(params: URLSearchParams): AdminOrderQueryParams {
    const query: AdminOrderQueryParams = {
        page: getPageParam(params),
        pageSize,
    };
    const status = getOrderStatusParam(params);
    const fromDate = getUtcDateBoundary(params, "fromDate");
    const toDate = getUtcDateBoundary(params, "toDate");

    assignStringParam(query, params, "search");
    assignStringParam(query, params, "userName");
    assignStringParam(query, params, "userEmail");
    assignNumberParam(query, params, "orderId");

    if (status) {
        query.status = status;
    }

    if (fromDate) {
        query.fromDate = fromDate;
    }

    if (toDate) {
        query.toDate = toDate;
    }

    return query;
}

export function buildUserQuery(params: URLSearchParams): AdminUserQueryParams {
    const query: AdminUserQueryParams = {
        page: getPageParam(params),
        pageSize,
    };

    assignStringParam(query, params, "search");
    assignStringParam(query, params, "fullName");
    assignStringParam(query, params, "email");
    assignStringParam(query, params, "phone");
    assignNumberParam(query, params, "userId");

    if (getBooleanParam(params, "includeDisabled")) {
        query.includeDisabled = true;
    }

    return query;
}

export function getAdminProductDisplayPrice(product: AdminProductResponseDto) {
    return product.hasDiscount && product.discountPrice != null
        ? product.discountPrice
        : product.price;
}

export function getAdminErrorMessage(error: unknown) {
    return getApiError(error)?.message ?? "We could not load this section.";
}
