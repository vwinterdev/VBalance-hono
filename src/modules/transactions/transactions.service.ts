import { TransactionsRepository } from './transactions.repository.js'
import type { GetTransactionsDto } from './transactions.dto.js'
import supabase from '../../config/supabase.config.js'

export class TransactionsService {
    private repository: TransactionsRepository

    constructor() {
      this.repository = new TransactionsRepository()
    }

    async createTransaction(dto:  { userId: string, balance: number, categoryId: string, walletId: number }) {
        // Проверяем доступ пользователя к кошельку
        const { data: walletUser, error: walletError } = await supabase
            .from('wallet_users')
            .select('role')
            .eq('wallet_id', dto.walletId)
            .eq('user_id', dto.userId)
            .single()
        
        if (walletError || !walletUser) {
            throw new Error('Access denied to wallet')
        }
        
        // Проверяем права на создание транзакции (только owner и editor)
        if (walletUser.role !== 'owner' && walletUser.role !== 'editor') {
            throw new Error('Insufficient permissions to create transaction')
        }

        // Определяем тип транзакции на основе знака баланса
        const type: 'income' | 'expense' = dto.balance > 0 ? 'income' : 'expense'
        
        return await this.repository.createTransaction({
            balance: Math.abs(dto.balance), // Сохраняем абсолютное значение
            categoryId: dto.categoryId,
            walletId: dto.walletId,
            userId: dto.userId,
            type: type,
        })
    }

    async getTransactions(dto: GetTransactionsDto) {
        return await this.repository.getTransactions(dto)
    }
}