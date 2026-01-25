export interface GetCategoriesDto {
  userId: string
  walletId?: number  // Если указан, возвращаются категории этого кошелька, иначе - всех кошельков пользователя
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
  walletId: number
  color: string
  secondColor?: string
  icon: string
  type: 'incomes' | 'expenses' | 'mixed'
}

export interface CreateCategoryDto extends Array<CategoryDto> {}

export interface CreateCategoryResponse {
  code: number
  message: string
}