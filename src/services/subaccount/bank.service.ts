import { post } from '@/services/api/api.service'

/**
 * Get all registered banks available for selection.
 */
export async function getRegisteredBanks() {
  try {
    const response = await post('/mdb/procedure/get_registered_banks', {
      p_status: 1
    })

    console.log('🏦 REGISTERED BANK RESPONSE:', response?.data)

    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch registered banks:', error)
    throw error
  }
}

/**
 * Get merchant settlement bank accounts.
 *
 * POST /mdb/procedure/get_Merchant_SettlementBanks
 */
export async function getMerchantSettlementBanks(params: {
  accountId: string
  merchantId: string
  subaccountId?: string
}) {
  const payload = {
    p_accountid: String(params.accountId).trim(),
    p_merchantid: String(params.merchantId).trim(),
    p_subaccountid: String(params.subaccountId || params.merchantId).trim()
  }

  try {
    console.log('🏦 GET MERCHANT SETTLEMENT BANKS REQUEST:', payload)

    const response = await post('/mdb/procedure/get_Merchant_SettlementBanks', payload)

    console.log('🏦 MERCHANT SETTLEMENT BANK RESPONSE:', response?.data)

    return response.data
  } catch (error: any) {
    console.error('❌ Failed to fetch merchant settlement banks:', error?.response?.data || error)

    throw error
  }
}

/**
 * Add a new merchant settlement bank account.
 *
 * POST /mdb/procedure/add_Merchant_SettlementBank
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
  const payload = {
    p_accountid: String(params.accountId).trim(),
    p_merchantid: String(params.merchantId).trim(),
    p_subaccountid: String(params.subaccountId || params.merchantId).trim(),
    p_bankid: String(params.bankId).trim(),
    p_bankaccountno: String(params.bankAccountNo).trim(),
    p_bankaccountname: String(params.bankAccountName).trim(),
    p_banksortcode: String(params.bankSortCode).trim(),
    p_quidlyuserid: String(params.quidlyUserId).trim()
  }

  try {
    console.log('🏦 ADD MERCHANT SETTLEMENT BANK REQUEST:', payload)

    const response = await post('/mdb/procedure/add_Merchant_SettlementBank', payload)

    console.log('✅ ADD MERCHANT SETTLEMENT BANK RESPONSE:', response?.data)

    return response.data
  } catch (error: any) {
    console.error('❌ Failed to add merchant settlement bank:', error?.response?.data || error)

    throw error
  }
}

/**
 * Update the status of a merchant settlement bank.
 *
 * Status:
 * 1  = Active
 * 0  = Inactive
 * 99 = Deleted
 *
 * POST /mdb/procedure/updatestatus_Merchant_SettlementBank_v2
 */
export async function updateMerchantSettlementBankStatus(params: {
  accountId: string
  merchantId: string
  bankId: string
  bankAccountNo: string
  quidlyUserId: string
  status: number
}) {
  const payload = {
    p_accountid: String(params.accountId).trim(),
    p_merchantid: String(params.merchantId).trim(),

    // The old working implementation used merchantId
    // as p_subaccountid for this procedure.
    p_subaccountid: String(params.merchantId).trim(),

    p_bankid: String(params.bankId).trim(),
    p_bankaccountno: String(params.bankAccountNo).trim(),
    p_quidlyuserid: String(params.quidlyUserId).trim(),
    p_status: Number(params.status)
  }

  console.log('======================================')
  console.log('🔄 UPDATE MERCHANT BANK STATUS REQUEST')
  console.log(JSON.stringify(payload, null, 2))
  console.log('======================================')

  try {
    const response = await post('/mdb/procedure/updatestatus_Merchant_SettlementBank_v2', payload)
    console.log('🚨 DELETE/STATUS EXACT PAYLOAD:', {
      p_accountid: payload.p_accountid,
      p_merchantid: payload.p_merchantid,
      p_subaccountid: payload.p_subaccountid,
      p_bankid: payload.p_bankid,
      p_bankaccountno: payload.p_bankaccountno,
      p_bankaccountno_type: typeof payload.p_bankaccountno,
      p_quidlyuserid: payload.p_quidlyuserid,
      p_status: payload.p_status
    })

    console.log('======================================')
    console.log('✅ UPDATE MERCHANT BANK STATUS RESPONSE')
    console.log(response?.data)
    console.log('======================================')

    return response.data
  } catch (error: any) {
    console.log('======================================')
    console.error('❌ UPDATE MERCHANT BANK STATUS FAILED')
    console.error('HTTP STATUS:', error?.response?.status)
    console.error('RESPONSE DATA:', error?.response?.data)
    console.error('REQUEST DATA:', error?.config?.data)
    console.log('======================================')

    throw error
  }
}

export default {
  getRegisteredBanks,
  getMerchantSettlementBanks,
  addMerchantSettlementBank,
  updateMerchantSettlementBankStatus
}
