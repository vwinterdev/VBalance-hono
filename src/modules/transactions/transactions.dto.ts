export interface CreateTransactionDto {
  balance: number
  categoryId: string
  userId: string
  isPositive: boolean
}

export interface GetTransactionsDto {
  userId: string
  month?: number  // 1-12
  year?: number   // 2024, 2025...
}

export interface TransactionResponse {
  id: string
  balance: number
  categoryId: string
  isPositive: boolean
  createdAt: string
}