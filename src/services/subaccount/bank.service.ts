import { post } from '@/services/api/api.service'

export async function getRegisteredBanks() {
  const response = await post(
    '/mdb/procedure/get_registered_banks',
    {
      p_status: 0
    }
  )

  console.log('🏦 REGISTERED BANKS RESPONSE:', response)

  return response.data
}

export default {
  getRegisteredBanks
}