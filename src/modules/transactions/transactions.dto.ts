export interface CreateTransactionDto {
  balance: number
  categoryId: string
  walletId: number
  userId: string
  type: 'income' | 'expense'
}

export interface GetTransactionsDto {
  userId: string
  walletId?: number  // Фильтр по кошельку (если не указан, возвращаются все кошельки пользователя)
  month?: number  // 1-12
  year?: number   // 2024, 2025...
}

export interface CategoryData {
  id: string
  name: string
  icon: string
  color: string
  secondColor: string
  type: 'incomes' | 'expenses' | 'mixed'
}

export interface TransactionResponse {
  id: string
  balance: number
  categoryId: string
  isPositive: boolean
  createdAt: string
  category?: CategoryData
}