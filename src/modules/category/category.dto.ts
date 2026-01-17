export interface GetCategoriesDto {
  userUUID: string
}

export interface Category {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface CategoryResponse {
  categories: Category[]
}

export interface CategoryDto {
  name: string
  userId: string
  color: string
  secondColor: string
  icon: string
}

export interface CreateCategoryDto extends Array<CategoryDto> {}

export interface CreateCategoryResponse {
  code: number
  message: string
}