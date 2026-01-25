import { HTTPException } from 'hono/http-exception'
import { WalletRepository } from './wallet.repository.js'
import type { CreateWalletDto, UpdateWalletDto, CreateWalletResponse } from './wallet.dto.js'

export class WalletService {
  private repository: WalletRepository

  constructor() {
    this.repository = new WalletRepository()
  }

  async createWallet(dto: CreateWalletDto, userId: string): Promise<CreateWalletResponse> {
    try {
      const wallet = await this.repository.createWallet(dto)

      await this.repository.addUserToWallet(wallet.id, userId, 'owner')

      return {
        message: 'Wallet created successfully',
        walletId: wallet.id
      }
    } catch (error: any) {
      throw new HTTPException(500, { message: error.message })
    }
  }

  async getUserWallets(userId: string) {
    try {
      return await this.repository.getUserWallets(userId)
    } catch (error: any) {
      throw new HTTPException(500, { message: error.message })
    }
  }

  async getWalletById(walletId: number, userId: string) {
    const wallet = await this.repository.getWalletById(walletId, userId)

    if (!wallet) {
      throw new HTTPException(404, { message: 'Wallet not found or access denied' })
    }

    return wallet
  }

  async updateWallet(walletId: number, dto: UpdateWalletDto, userId: string) {
    const role = await this.repository.checkUserRole(walletId, userId)

    if (!role) {
      throw new HTTPException(404, { message: 'Wallet not found' })
    }

    if (role !== 'owner') {
      throw new HTTPException(403, { message: 'Only wallet owner can update wallet' })
    }

    try {
      await this.repository.updateWallet(walletId, dto)
      return { message: 'Wallet updated successfully' }
    } catch (error: any) {
      throw new HTTPException(500, { message: error.message })
    }
  }

  async deleteWallet(walletId: number, userId: string) {
    const role = await this.repository.checkUserRole(walletId, userId)

    if (!role) {
      throw new HTTPException(404, { message: 'Wallet not found' })
    }

    if (role !== 'owner') {
      throw new HTTPException(403, { message: 'Only wallet owner can delete wallet' })
    }

    try {
      await this.repository.deleteWallet(walletId)
      return { message: 'Wallet deleted successfully' }
    } catch (error: any) {
      throw new HTTPException(500, { message: error.message })
    }
  }
}
