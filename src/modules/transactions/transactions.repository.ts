

import type { CreateTransactionDto, GetTransactionsDto, TransactionResponse } from './transactions.dto.js'
import supabase from '../../config/supabase.config.js'

export class TransactionsRepository {

    async createTransaction(dto: CreateTransactionDto) {
        const { data, error } = await supabase
            .from('transaction')
            .insert({
                balance: dto.balance,
                category_id: dto.categoryId,
                user_id: dto.userId,
                is_positive: dto.isPositive,
            })
            .select()
            .single()
    
        if (error) throw error
        return data
    }

    async getTransactions(dto: GetTransactionsDto): Promise<TransactionResponse[]> {
        let query = supabase
            .from('transaction')
            .select('*')
            .eq('user_id', dto.userId)
            .order('created_at', { ascending: false })

        if (dto.year && dto.month) {
            // Фильтр по месяцу и году
            const startDate = new Date(dto.year, dto.month - 1, 1).toISOString()
            const endDate = new Date(dto.year, dto.month, 0, 23, 59, 59).toISOString()
            query = query.gte('created_at', startDate).lte('created_at', endDate)
        } else if (dto.year) {
            // Только год
            const startDate = new Date(dto.year, 0, 1).toISOString()
            const endDate = new Date(dto.year, 11, 31, 23, 59, 59).toISOString()
            query = query.gte('created_at', startDate).lte('created_at', endDate)
        }

        const { data, error } = await query

        if (error) throw new Error(error.message)

        return data.map(t => ({
            id: t.id,
            balance: t.balance,
            categoryId: t.category_id,
            isPositive: t.is_positive,
            createdAt: t.created_at
        }))
    }
}

