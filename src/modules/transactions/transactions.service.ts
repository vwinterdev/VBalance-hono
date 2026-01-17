import { TransactionsRepository } from './transactions.repository.js'
import type { GetTransactionsDto } from './transactions.dto.js'

export class TransactionsService {
    private repository: TransactionsRepository

    constructor() {
      this.repository = new TransactionsRepository()
    }

    async createTransaction(dto:  { userId: string, balance: number, categoryId: string }) {
        return await this.repository.createTransaction({
            balance: dto.balance,
            categoryId: dto.categoryId,
            userId: dto.userId,
            isPositive: dto.balance > 0,
        })
    }

    async getTransactions(dto: GetTransactionsDto) {
        return await this.repository.getTransactions(dto)
    }
}