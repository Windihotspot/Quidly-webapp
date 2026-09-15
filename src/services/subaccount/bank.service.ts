import { post } from '@/services/api/api.service'

/**
 * Get all registered banks available for selection.
 */
export async function getRegisteredBanks() {
  const response = await post('/mdb/procedure/get_registered_banks', {
    p_status: 1
  })

  console.log('🏦 REGISTERED BANK RESPONSE:', response?.data)

  return response.data
}

/**
 * Get bank accounts already connected to the active merchant.
 */
export async function getMerchantSettlementBanks(params: {
  accountId: string
  merchantId: string
  subaccountId?: string
}) {
  const response = await post('/mdb/procedure/get_Merchant_SettlementBanks', {
    p_accountid: params.accountId,
    p_merchantid: params.merchantId,
    p_subaccountid: params.subaccountId || ''
  })

  console.log('🏦 MERCHANT SETTLEMENT BANK RESPONSE:', response?.data)

  return response.data
}

/**
 * Add a new merchant settlement bank account.
 */
export async function addMerchantSettlementBank(params: {
  accountId: string
  merchantId: string
  subaccountId?: string
  bankId: string
  bankAccountNo: string
  bankAccountName: string
  bankSortCode: string
  quidlyUserId: string
}) {
  const response = await post('/mdb/procedure/add_Merchant_SettlementBank', {
    p_accountid: params.accountId,
    p_merchantid: params.merchantId,
    p_subaccountid: params.subaccountId || '',
    p_bankid: params.bankId,
    p_bankaccountno: params.bankAccountNo,
    p_bankaccountname: params.bankAccountName,
    p_banksortcode: params.bankSortCode,
    p_quidlyuserid: params.quidlyUserId
  })

  console.log('✅ ADD MERCHANT SETTLEMENT BANK RESPONSE:', response?.data)

  return response.data
}

export default {
  getRegisteredBanks,
  getMerchantSettlementBanks,
  addMerchantSettlementBank
}
