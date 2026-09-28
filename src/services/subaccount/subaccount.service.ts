import { post } from '@/services/api/api.service'

export interface ActiveBank {
  bankid: string
  bankaccountno: string
  banksortcode: string
  status: number
  bankname?: string
}

export interface Subaccount {
  accountid: string
  merchantid: string
  subaccountname: string
  subaccountid: string
  subaccounttoken: string
  entrydt: string
  quidlyuserid: string
  status: number
  activeBank: ActiveBank | null
}

export interface GetSubaccountsResponse {
  status: number
  data: Subaccount[]
  error?: string
}

export async function getSubaccounts(accountId: string, merchantId: string): Promise<Subaccount[]> {
  try {
    const response = await post<GetSubaccountsResponse>('/get_subaccounts_with_banks', {
      p_accountid: accountId,
      p_merchantid: merchantId
    })

    if (response.data?.error) {
      throw new Error(response.data.error)
    }

    if (!Array.isArray(response.data?.data)) {
      throw new Error('Invalid subaccounts response from server')
    }

    return response.data.data
  } catch (error) {
    console.error('❌ Failed to fetch subaccounts:', error)
    throw error
  }
}

/* -------------------------------------------------------------------------- */
/* ADD SUBACCOUNT                                                             */
/* -------------------------------------------------------------------------- */

export interface AddSubaccountPayload {
  p_accountid: string
  p_merchantid: string
  p_subaccountname: string
  p_quidlyuserid: string
  p_bankid: string
  p_bankaccountno: string
}

export interface AddSubaccountResponse {
  status: number
  subaccount?: {
    subaccountID: string
    bank?: {
      bankDetails: string
    }
  }
  error?: string
}

export async function addSubaccount(payload: AddSubaccountPayload): Promise<AddSubaccountResponse> {
  try {
    const cleanPayload = {
      ...payload,
      p_bankaccountno: String(payload.p_bankaccountno).trim()
    }

    console.log('➕ ADD SUBACCOUNT PAYLOAD:', cleanPayload)

    const response = await post<AddSubaccountResponse>('/add_subaccount_and_bank', cleanPayload)

    console.log('➕ ADD SUBACCOUNT RESPONSE:', response.data)

    if (response.data?.error) {
      throw new Error(response.data.error)
    }

    if (response.data?.status !== 1) {
      throw new Error(response.data?.error || 'Failed to add subaccount')
    }

    return response.data
  } catch (error) {
    console.error('❌ Failed to add subaccount:', error)
    throw error
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE SUBACCOUNT BANK                                                     */
/* -------------------------------------------------------------------------- */

export interface UpdateSubaccountPayload {
  p_accountid: string
  p_merchantid: string
  p_subaccountid: string
  p_quidlyuserid: string
  p_bankid: string

  // Swagger defines these as numbers.
  p_bankaccountno: number
  p_bankid_old: string
  p_bankaccountno_old: number
  p_banksortcode: number
}

export interface UpdateSubaccountResponse {
  status?: number
  subaccount?: Record<string, unknown>
  error?: string
  [key: string]: unknown
}

export async function updateSubaccount(
  payload: UpdateSubaccountPayload
): Promise<UpdateSubaccountResponse> {
  try {
    const cleanPayload: UpdateSubaccountPayload = {
      p_accountid: String(payload.p_accountid),
      p_merchantid: String(payload.p_merchantid),
      p_subaccountid: String(payload.p_subaccountid),
      p_quidlyuserid: String(payload.p_quidlyuserid),
      p_bankid: String(payload.p_bankid),

      // Keep these as actual JSON numbers.
      p_bankaccountno: Number(payload.p_bankaccountno),
      p_bankid_old: String(payload.p_bankid_old),
      p_bankaccountno_old: Number(payload.p_bankaccountno_old),
      p_banksortcode: Number(payload.p_banksortcode)
    }

    // Final validation before sending to the API.
    if (!Number.isSafeInteger(cleanPayload.p_bankaccountno) || cleanPayload.p_bankaccountno <= 0) {
      throw new Error('Invalid bank account number')
    }

    if (
      !Number.isSafeInteger(cleanPayload.p_bankaccountno_old) ||
      cleanPayload.p_bankaccountno_old <= 0
    ) {
      throw new Error('Invalid old bank account number')
    }

    if (!Number.isSafeInteger(cleanPayload.p_banksortcode) || cleanPayload.p_banksortcode < 0) {
      throw new Error('Invalid bank sort code')
    }

    console.log('✏️ UPDATE SUBACCOUNT PAYLOAD:', cleanPayload)

    console.log(
      '🏦 NEW ACCOUNT:',
      cleanPayload.p_bankaccountno,
      typeof cleanPayload.p_bankaccountno
    )

    console.log(
      '🏦 OLD ACCOUNT:',
      cleanPayload.p_bankaccountno_old,
      typeof cleanPayload.p_bankaccountno_old
    )

    console.log('🏦 SORT CODE:', cleanPayload.p_banksortcode, typeof cleanPayload.p_banksortcode)

    const response = await post<UpdateSubaccountResponse>('/update_subaccount_bank', cleanPayload)

    console.log('✏️ UPDATE SUBACCOUNT RESPONSE:', response.data)

    /*
     * The Swagger endpoint documents HTTP 200 as success.
     *
     * Do NOT require:
     *   response.data.status === 1
     *
     * because the Swagger response schema shows:
     *
     * {
     *   "status": 0,
     *   "subaccount": {}
     * }
     *
     * Axios will already throw for HTTP 400/500 responses.
     */
    if (response.data?.error) {
      throw new Error(response.data.error)
    }

    return response.data
  } catch (error) {
    console.error('❌ Failed to update subaccount:', error)
    throw error
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE SUBACCOUNT STATUS                                                   */
/* -------------------------------------------------------------------------- */

export interface UpdateSubaccountStatusPayload {
  p_accountid: string
  p_merchantid: string
  p_subaccountid: string
  p_quidlyuserid: string
  p_status: number
}

export interface UpdateSubaccountStatusResponse {
  status?: number
  message?: string
  error?: string
  [key: string]: unknown
}

export async function updateSubaccountStatus(
  payload: UpdateSubaccountStatusPayload
): Promise<UpdateSubaccountStatusResponse> {
  try {
    console.log('🔄 UPDATE SUBACCOUNT STATUS PAYLOAD:', payload)

    const response = await post<UpdateSubaccountStatusResponse>(
      '/mdb/procedure/updatestatus_Merchant_Subaccount_v2',
      payload
    )

    console.log('🔄 UPDATE SUBACCOUNT STATUS RESPONSE:', response.data)

    if (response.data?.error) {
      throw new Error(response.data.error)
    }

    return response.data
  } catch (error) {
    console.error('❌ Failed to update subaccount status:', error)
    throw error
  }
}

export default {
  getSubaccounts,
  addSubaccount,
  updateSubaccount,
  updateSubaccountStatus
}
