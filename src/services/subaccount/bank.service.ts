import { post } from '@/services/api/api.service'

export async function getRegisteredBanks() {
  const response = await post('/mdb/procedure/get_registered_banks', {
    p_status: 1
  })

  console.log('================================')
  console.log('🏦 FULL REGISTERED BANK RESPONSE')
  console.log(response)
  console.log('🏦 RESPONSE.DATA')
  console.log(response?.data)
  console.log('🏦 RESPONSE.DATA.DATA')
  console.log(response?.data?.data)
  console.log('🏦 RESPONSE.DATA.RESULT')
  console.log(response?.data?.result)
  console.log('================================')

  return response.data
}

export default {
  getRegisteredBanks
}
