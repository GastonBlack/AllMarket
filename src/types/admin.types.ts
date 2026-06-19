import type { UserRole } from "./auth.types";
import type { OrderStatus } from "./orders.types";

export type AdminProductSortBy =
    | "stock_asc"
    | "stock_desc"
    | "reserved_asc"
    | "reserved_desc"
    | "available_asc"
    | "available_desc"
    | "sold_desc"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc";

export type AdminProductStatus = "active" | "disabled" | "all";

export interface AdminProductQueryParams {
    search?: string;
    categoryId?: number;
    status?: AdminProductStatus;
    minStock?: number;
    maxStock?: number;
    minReservedStock?: number;
    maxReservedStock?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: AdminProductSortBy;
    page?: number;
    pageSize?: number;
}

export interface AdminProductResponseDto {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    reservedStock: number;
    availableStock: number;
    totalSold: number;
    hasDiscount: boolean;
    discountPrice?: number | null;
    isActive: boolean;
    imageUrl?: string | null;
    categoryId: number;
    categoryName: string;
    createdAt: string;
}

export interface AdminCreateProductDto {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
    image?: File | null;
}

export interface AdminUpdateProductDto {
    name: string;
    description: string;
    price: number;
    stock: number;
    reservedStock: number;
    hasDiscount: boolean;
    discountPrice?: number | null;
    isActive: boolean;
    imageUrl?: string | null;
    categoryId: number;
}

export interface UpdateAdminProductStatusDto {
    isActive: boolean;
}

export interface UpdateAdminProductDiscount {
    discount: boolean;
    discountPercentage?: number | null;
    discountPrice?: number | null;
}

export interface AdminCategoryQueryParams {
    search?: string;
    onlyWithoutProducts?: boolean;
    page?: number;
    pageSize?: number;
}

export interface AdminCategoryResponseDto {
    id: number;
    name: string;
    productCount: number;
    hasProducts: boolean;
}

export interface AdminCreateCategoryDto {
    name: string;
}

export interface AdminUpdateCategoryDto {
    id: number;
    name: string;
}

export interface AdminOrderQueryParams {
    search?: string;
    orderId?: number;
    userName?: string;
    userEmail?: string;
    status?: OrderStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
}

export interface AdminOrderResponseDto {
    id: number;
    userId: number;
    userFullName: string;
    userEmail: string;
    productCount: number;
    status: OrderStatus;
    totalPrice: number;
    createdAt: string;
}

export interface AdminOrderItemResponseDto {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
    subtotal: number;
}

export interface AdminOrderDetailResponseDto {
    id: number;
    userId: number;
    userFullName: string;
    userEmail: string;
    createdAt: string;
    reservationExpiresAt?: string | null;
    status: OrderStatus;
    canChangeStatus: boolean;
    canRefund: boolean;
    totalPrice: number;
    items: AdminOrderItemResponseDto[];
}

export interface UpdateAdminOrderStatusDto {
    status: OrderStatus;
}

export interface AdminUserQueryParams {
    search?: string;
    userId?: number;
    fullName?: string;
    email?: string;
    phone?: string;
    includeDisabled?: boolean;
    page?: number;
    pageSize?: number;
}

export interface AdminUserResponseDto {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
    rol: UserRole;
    isActive: boolean;
    createdAt: string;
    disabledAt?: string | null;
}

export interface UpdateAdminUserStatusDto {
    isActive: boolean;
}
