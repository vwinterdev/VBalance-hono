

import type { CreateTransactionDto, GetTransactionsDto, TransactionResponse } from './transactions.dto.js'
import supabase from '../../config/supabase.config.js'

export class TransactionsRepository {

    async createTransaction(dto: CreateTransactionDto) {
        const { data, error } = await supabase
            .from('transaction')
            .insert({
                balance: dto.balance,
                category_id: dto.categoryId,
                wallet_id: dto.walletId,
                user_id: dto.userId,
                type: dto.type,
            })
            .select(`
                *,
                category (
                    id,
                    name,
                    icon,
                    color,
                    second_color,
                    type
                )
            `)
            .single()
    
        if (error) throw error
        return data
    }

    async getTransactions(dto: GetTransactionsDto): Promise<TransactionResponse[]> {
        // Получаем список кошельков пользователя
        let walletIds: number[] = []
        
        if (dto.walletId) {
            // Проверяем доступ пользователя к указанному кошельку
            const { data: walletUser, error: walletError } = await supabase
                .from('wallet_users')
                .select('wallet_id')
                .eq('wallet_id', dto.walletId)
                .eq('user_id', dto.userId)
                .single()
            
            if (walletError || !walletUser) {
                throw new Error('Access denied to wallet')
            }
            walletIds = [dto.walletId]
        } else {
            // Получаем все кошельки пользователя
            const { data: walletUsers, error: walletError } = await supabase
                .from('wallet_users')
                .select('wallet_id')
                .eq('user_id', dto.userId)
            
            if (walletError) throw new Error(walletError.message)
            walletIds = walletUsers?.map(wu => wu.wallet_id) || []
        }

        if (walletIds.length === 0) {
            return []
        }

        // Получаем транзакции для этих кошельков с JOIN категорий
        let query = supabase
            .from('transaction')
            .select(`
                *,
                category (
                    id,
                    name,
                    icon,
                    color,
                    second_color,
                    type
                )
            `)
            .in('wallet_id', walletIds)
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

        return data.map(t => {
            const category = t.category ? (Array.isArray(t.category) ? t.category[0] : t.category) : null
            
            return {
                id: t.id.toString(),
                balance: parseFloat(t.balance),
                categoryId: t.category_id.toString(),
                isPositive: t.type === 'income',
                createdAt: t.created_at,
                category: category ? {
                    id: category.id.toString(),
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    secondColor: category.second_color,
                    type: category.type
                } : undefined
            }
        })
    }
}

