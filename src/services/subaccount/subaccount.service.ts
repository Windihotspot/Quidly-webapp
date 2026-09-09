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

export default {
  getSubaccounts
}