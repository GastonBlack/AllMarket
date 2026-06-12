import { api } from "@/lib/axios";

import type {
  CreateProductDto,
  PaginatedResponse,
  ProductQueryParams,
  ProductResponseDto,
  UpdateProductDto,
} from "@/types";

export const productsService = {
  async getAll(
    queryParams?: ProductQueryParams,
  ): Promise<PaginatedResponse<ProductResponseDto>> {
    const response = await api.get<PaginatedResponse<ProductResponseDto>>(
      "/api/products",
      {
        params: queryParams,
      },
    );

    return response.data;
  },

  async getById(productId: number): Promise<ProductResponseDto> {
    const response = await api.get<ProductResponseDto>(
      `/api/products/${productId}`,
    );

    return response.data;
  },

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const response = await api.post<ProductResponseDto>("/api/products", dto);

    return response.data;
  },

  async update(
    productId: number,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const response = await api.patch<ProductResponseDto>(
      `/api/products/${productId}`,
      dto,
    );

    return response.data;
  },

  async disable(productId: number): Promise<ProductResponseDto> {
    const response = await api.patch<ProductResponseDto>(
      `/api/products/${productId}/disable`,
    );

    return response.data;
  },

  async enable(productId: number): Promise<ProductResponseDto> {
    const response = await api.patch<ProductResponseDto>(
      `/api/products/${productId}/enable`,
    );

    return response.data;
  },

  async delete(productId: number): Promise<boolean> {
    const response = await api.delete<boolean>(`/api/products/${productId}`);

    return response.data;
  },

  async updateStock(
    productId: number,
    quantity: number,
  ): Promise<ProductResponseDto> {
    const response = await api.patch<ProductResponseDto>(
      `/api/products/${productId}/stock`,
      null,
      {
        params: {
          quantity,
        },
      },
    );

    return response.data;
  },
};
