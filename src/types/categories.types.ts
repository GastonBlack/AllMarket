export interface CategoryResponseDto {
  id: number;
  name: string;
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  id: number;
  name: string;
}
