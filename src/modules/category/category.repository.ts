
import type { GetCategoriesDto, CategoryResponse, CreateCategoryDto, CreateCategoryResponse } from './category.dto.js'
import supabase from '../../config/supabase.config.js'

export class CategoryRepository {

  async getCategories(dto: GetCategoriesDto): Promise<CategoryResponse> {
    let query = supabase.from('category').select('*')
    
    if (dto.walletId) {
      // Фильтруем по конкретному кошельку
      query = query.eq('wallet_id', dto.walletId)
      
      // Проверяем доступ пользователя к кошельку
      const { data: walletUser, error: walletError } = await supabase
        .from('wallet_users')
        .select('wallet_id')
        .eq('wallet_id', dto.walletId)
        .eq('user_id', dto.userId)
        .single()
      
      if (walletError || !walletUser) {
        throw new Error('Access denied to wallet')
      }
    } else {
      // Получаем категории всех кошельков пользователя
      const { data: walletUsers, error: walletError } = await supabase
        .from('wallet_users')
        .select('wallet_id')
        .eq('user_id', dto.userId)
      
      if (walletError) throw new Error(walletError.message)
      const walletIds = walletUsers?.map(wu => wu.wallet_id) || []
      
      if (walletIds.length === 0) {
        return { categories: [] }
      }
      
      query = query.in('wallet_id', walletIds)
    }
    
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return { categories: data }
  }

  async createCategory(dto: CreateCategoryDto, userId: string): Promise<CreateCategoryResponse> {
    // Проверяем доступ пользователя к кошельку
    const walletIds = [...new Set(dto.map(c => c.walletId))]
    
    for (const walletId of walletIds) {
      const { data: walletUser, error: walletError } = await supabase
        .from('wallet_users')
        .select('role')
        .eq('wallet_id', walletId)
        .eq('user_id', userId)
        .single()
      
      if (walletError || !walletUser) {
        throw new Error('Access denied to wallet')
      }
      
      // Проверяем права на создание категории (только owner и editor)
      if (walletUser.role !== 'owner' && walletUser.role !== 'editor') {
        throw new Error('Insufficient permissions to create category')
      }
    }
    
    const { error } = await supabase.from('category').insert(dto.map(category => ({ 
        name: category.name, 
        wallet_id: category.walletId,
        color: category.color,
        second_color: category.secondColor || category.color,
        icon: category.icon,
        type: category.type
    })))
    if (error) throw new Error(error.message)
    return {
        code: 201, 
        message: 'Category created successfully'
    }
  }
}