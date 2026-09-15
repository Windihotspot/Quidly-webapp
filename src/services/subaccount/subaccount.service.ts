import { post } from '@/services/api/api.service'

export interface ActiveBank {
  bankid: string
  bankaccountno: string
  banksortcode: string
  status: number
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

interface GetSubaccountsResponse {
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

    console.log('FULL SUBACCOUNT RESPONSE:', response)
    console.log('SUBACCOUNT RESPONSE DATA:', response.data)

    if (response.data?.error) {
      throw new Error(response.data.error)
    }

    if (!Array.isArray(response.data?.data)) {
      throw new Error('Invalid subaccounts response from server')
    }

    return response.data.data
  } catch (error) {
    console.error('Failed to fetch subaccounts:', error)
    throw error
  }
}

// add subaccount
export interface AddSubaccountPayload {
  p_accountid: string
  p_merchantid: string
  p_subaccountname: string
  p_quidlyuserid: string
  p_bankid: string
  p_bankaccountno: number
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
    const response = await post<AddSubaccountResponse>('/add_subaccount_and_bank', payload)

    console.log('➕ ADD SUBACCOUNT RESPONSE:', response.data)

    if (response.data?.status !== 1) {
      throw new Error(response.data?.error || 'Failed to add subaccount')
    }

    return response.data
  } catch (error) {
    console.error('❌ Failed to add subaccount:', error)
    throw error
  }
}

// update subaccount
export interface UpdateSubaccountPayload {
  p_accountid: string
  p_merchantid: string
  p_subaccountid: string
  p_quidlyuserid: string
  p_bankid: string
  p_bankaccountno: number
  p_bankid_old: string
  p_bankaccountno_old: number
  p_banksortcode: number
}

export interface UpdateSubaccountResponse {
  status: number
  subaccount?: Record<string, unknown>
  error?: string
}

export async function updateSubaccount(
  payload: UpdateSubaccountPayload
): Promise<UpdateSubaccountResponse> {
  try {
    const response = await post<UpdateSubaccountResponse>('/update_subaccount_bank', payload)

    console.log('✏️ UPDATE SUBACCOUNT RESPONSE:', response.data)

    if (response.data?.error) {
      throw new Error(response.data.error)
    }

    return response.data
  } catch (error) {
    console.error('❌ Failed to update subaccount:', error)
    throw error
  }
}

// update subaccount status (active / inactive)
export interface UpdateSubaccountStatusPayload {
  p_accountid: string
  p_merchantid: string
  p_subaccountid: string
  p_quidlyuserid: string
  p_status: number // 1 = active, 0 = inactive
}

// delete subaccount
// --------------------------------------------------
// Update subaccount status
//
// 1  = Active
// 0  = Inactive
// 99 = Deleted
// --------------------------------------------------

export interface UpdateSubaccountStatusPayload {
  p_accountid: string
  p_merchantid: string
  p_subaccountid: string
  p_quidlyuserid: string
  p_status: number
}

export interface UpdateSubaccountStatusResponse {
  status: number
  error?: string
}

export async function updateSubaccountStatus(
  payload: UpdateSubaccountStatusPayload
): Promise<UpdateSubaccountStatusResponse> {
  try {
    const response = await post<UpdateSubaccountStatusResponse>(
      '/update_subaccount_status',
      payload
    )

    console.log('🔄 UPDATE SUBACCOUNT STATUS RESPONSE:', response.data)

    if (response.data?.error) {
      throw new Error(response.data.error)
    }

    if (response.data?.status !== 1) {
      throw new Error(response.data?.error || 'Failed to update subaccount status')
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
