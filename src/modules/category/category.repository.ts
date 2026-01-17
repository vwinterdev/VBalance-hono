
import type { GetCategoriesDto, CategoryResponse, CreateCategoryDto, CreateCategoryResponse } from './category.dto.js'
import supabase from '../../config/supabase.config.js'

export class CategoryRepository {

  async getCategories(dto: GetCategoriesDto): Promise<CategoryResponse> {
    const { data, error } = await supabase.from('category').select('*').eq('user_id', dto.userUUID)
    if (error) throw new Error(error.message)
    return { categories: data }
  }

  async createCategory(dto: CreateCategoryDto): Promise<CreateCategoryResponse> {
    const { error } = await supabase.from('category').insert(dto.map(category => ({ 
        name: category.name, 
        user_id: category.userId,
        color: category.color,
        second_color: category.secondColor,
        icon: category.icon
    })))
    if (error) throw new Error(error.message)
    return {
        code: 201, 
        message: 'Category created successfully'
    }
  }
  async createdStartUserCategories(userId: string) : Promise<CreateCategoryResponse> {
    return await this.createCategory([{
    name: 'Еда',
    userId: userId,
    color: '#FF0000',
    secondColor: '#FF0000',
    icon: '🍔'
   },{
    name: 'Транспорт',
    userId: userId,
    color: '#00FF00',
    secondColor: '#00FF00',
    icon: '🚗'
   }, ])
  }
}