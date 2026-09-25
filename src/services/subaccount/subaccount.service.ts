
import { post } from '@/services/api/api.service'

// --------------------------------------------------
// Active Bank
// --------------------------------------------------

export interface ActiveBank {
  bankid: string
  bankaccountno: string
  banksortcode: string
  status: number
}

// --------------------------------------------------
// Subaccount
// --------------------------------------------------

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

// --------------------------------------------------
// Get Subaccounts
// --------------------------------------------------

export interface GetSubaccountsResponse {
  status: number
  data: Subaccount[]
  error?: string
}

export async function getSubaccounts(
  accountId: string,
  merchantId: string
): Promise<Subaccount[]> {
  try {
    const response = await post<GetSubaccountsResponse>(
      '/get_subaccounts_with_banks',
      {
        p_accountid: accountId,
        p_merchantid: merchantId
      }
    )

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

// --------------------------------------------------
// Add Subaccount
// --------------------------------------------------

export interface AddSubaccountPayload {
  p_accountid: string
  p_merchantid: string
  p_subaccountname: string
  p_quidlyuserid: string
  p_bankid: string

  // Bank account numbers must remain strings.
  // They are identifiers, not numeric values.
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

export async function addSubaccount(
  payload: AddSubaccountPayload
): Promise<AddSubaccountResponse> {
  try {
    const response = await post<AddSubaccountResponse>(
      '/add_subaccount_and_bank',
      payload
    )

    if (response.data?.status !== 1) {
      throw new Error(
        response.data?.error || 'Failed to add subaccount'
      )
    }

    return response.data
  } catch (error) {
    console.error('Failed to add subaccount:', error)
    throw error
  }
}

// --------------------------------------------------
// Update Subaccount / Edit Bank Details
// --------------------------------------------------

export interface UpdateSubaccountPayload {
  p_accountid: string
  p_merchantid: string
  p_subaccountid: string
  p_quidlyuserid: string
  p_bankid: string

  // Bank account numbers must remain strings.
  p_bankaccountno: string

  p_bankid_old: string

  // Old bank account number must also remain a string.
  p_bankaccountno_old: string

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
    const response = await post<UpdateSubaccountResponse>(
      '/update_subaccount_bank',
      payload
    )

    if (response.data?.status !== 1) {
      throw new Error(
        response.data?.error || 'Failed to update subaccount'
      )
    }

    return response.data
  } catch (error) {
    console.error('Failed to update subaccount:', error)
    throw error
  }
}

// --------------------------------------------------
// Update Subaccount Status
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
      '/mdb/procedure/updatestatus_Merchant_Subaccount_v2',
      payload
    )

    if (response.data?.error) {
      throw new Error(response.data.error)
    }

    if (response.data?.status !== 1) {
      throw new Error(
        response.data?.error || 'Failed to update subaccount status'
      )
    }

    return response.data
  } catch (error) {
    console.error('Failed to update subaccount status:', error)
    throw error
  }
}

// --------------------------------------------------
// Default Service
// --------------------------------------------------

export default {
  getSubaccounts,
  addSubaccount,
  updateSubaccount,
  updateSubaccountStatus
}