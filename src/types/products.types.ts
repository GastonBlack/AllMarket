export interface ProductResponseDto {
  id: number;
  name: string;
  description: string;
  price: number;
  availableStock: number;
  hasDiscount: boolean;
  discountPrice?: number | null;
  imageUrl?: string | null;
  categoryId: number;
  categoryName: string;
}

export type ProductSortBy =
  | "popular"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc";

export interface ProductQueryParams {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
  sortBy?: ProductSortBy;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  reservedStock: number;
  hasDiscount: boolean;
  discountPrice?: number | null;
  imageUrl?: string | null;
  categoryId: number;
}

export interface UpdateProductDto {
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

export interface DisableProductDto {
    isActive: boolean;
}
