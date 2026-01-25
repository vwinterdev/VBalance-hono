import { CategoryRepository } from "./category.repository.js"
import type { CreateCategoryDto, CreateCategoryResponse, CategoryResponse, GetCategoriesDto } from "./category.dto.js"

export class CategoryService {

    private repository: CategoryRepository

    constructor() {
      this.repository = new CategoryRepository()
    }

    async getCategories(dto: GetCategoriesDto): Promise<CategoryResponse> {
        return await this.repository.getCategories(dto)
    }

    async createCategory(dto: CreateCategoryDto, userId: string): Promise<CreateCategoryResponse> {
        return await this.repository.createCategory(dto, userId)
    }
}