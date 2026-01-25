import supabase from '../../config/supabase.config.js'
import type { CreateWalletDto, UpdateWalletDto, WalletResponse } from './wallet.dto.js'

export class WalletRepository {

  async createWallet(dto: CreateWalletDto) {
    const { data, error } = await supabase
      .from('wallet')
      .insert({
        name: dto.name,
        currency: dto.currency,
        icon: dto.icon,
        color: dto.color,
        balance: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addUserToWallet(walletId: number, userId: string, role: string) {
    const { error } = await supabase
      .from('wallet_users')
      .insert({
        wallet_id: walletId,
        user_id: userId,
        role: role
      })

    if (error) throw error
  }

  async getUserWallets(userId: string): Promise<WalletResponse[]> {
    const { data, error } = await supabase
      .from('wallet_users')
      .select(`
        role,
        wallet:wallet (
          id,
          name,
          balance,
          currency,
          icon,
          color,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (error) throw error

    return data.map((item: any) => ({
      id: item.wallet.id,
      name: item.wallet.name,
      balance: parseFloat(item.wallet.balance),
      currency: item.wallet.currency,
      icon: item.wallet.icon,
      color: item.wallet.color,
      role: item.role,
      createdAt: item.wallet.created_at
    }))
  }

  async getWalletById(walletId: number, userId: string): Promise<WalletResponse | null> {
    const { data: access, error: accessError } = await supabase
      .from('wallet_users')
      .select('role')
      .eq('wallet_id', walletId)
      .eq('user_id', userId)
      .single()

    if (accessError || !access) return null


    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('id', walletId)
      .single()

    if (walletError) throw walletError

    return {
      id: wallet.id,
      name: wallet.name,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency,
      icon: wallet.icon,
      color: wallet.color,
      role: access.role,
      createdAt: wallet.created_at
    }
  }

  async updateWallet(walletId: number, dto: UpdateWalletDto) {
    const updateData: any = {}
    if (dto.name !== undefined) updateData.name = dto.name
    if (dto.currency !== undefined) updateData.currency = dto.currency
    if (dto.icon !== undefined) updateData.icon = dto.icon
    if (dto.color !== undefined) updateData.color = dto.color

    const { error } = await supabase
      .from('wallet')
      .update(updateData)
      .eq('id', walletId)

    if (error) throw error
  }

  async checkUserRole(walletId: number, userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('wallet_users')
      .select('role')
      .eq('wallet_id', walletId)
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data.role
  }

  async deleteWallet(walletId: number) {
    const { error } = await supabase
      .from('wallet')
      .delete()
      .eq('id', walletId)

    if (error) throw error
  }
}
