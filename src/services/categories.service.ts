import { api } from "@/lib/axios";

import type {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types";

export const categoriesService = {
  async getAll(): Promise<CategoryResponseDto[]> {
    const response = await api.get<CategoryResponseDto[]>("/api/categories");

    return response.data;
  },

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const response = await api.post<CategoryResponseDto>("/api/categories", dto);

    return response.data;
  },

  async update(dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const response = await api.patch<CategoryResponseDto>(
      "/api/categories",
      dto,
    );

    return response.data;
  },

  async delete(categoryId: number): Promise<boolean> {
    const response = await api.delete<boolean>(`/api/categories/${categoryId}`);

    return response.data;
  },
};
