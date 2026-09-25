<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import ApiService from '@/services/api/api.service'

import MainLayout from '@/layouts/MainLayout.vue'

// If you are using these components, uncomment/import them:
// import KYCWidgetMerchant2 from '@/components/widgets/mixed/quidly_KYCWidgetMerchant2.vue'
// import KYCWidgetMerchant3 from '@/components/widgets/mixed/quidly_KYCWidgetMerchant3.vue'
// import BusinessOwnerModal from '@/components/modals/forms/quidly_BusinessOwnerModal.vue'
// import BusinessDocumentModal from '@/components/modals/forms/quidly_BusinessDocumentModal.vue'

// --------------------------------------------------
// AUTH
// --------------------------------------------------

const authStore = useAuthStore()

const { user } = storeToRefs(authStore)

// --------------------------------------------------
// MERCHANT DETAILS
// --------------------------------------------------

const merchantData = ref<any>(null)

// For now, you are using a hardcoded merchant ID.
// Replace this with your auth store value when ready.
const merchantId = ref('Qde9b16d0d8')

// If your auth store has merchantuser, you can later use:
//
// const { merchantuser } = storeToRefs(authStore)
//
// const merchantId = computed(
//   () => merchantuser.value?.merchantid ?? ''
// )
//
// const accountId = computed(
//   () => merchantuser.value?.accountid ?? ''
// )
//
// const quidlyUserId = computed(
//   () => merchantuser.value?.quidlyuserid ?? ''
// )

// --------------------------------------------------
// API REQUEST DATA
// --------------------------------------------------

const p_userData = computed(() => ({
  merchantid: merchantId.value
}))

const p_merchantData = computed(() => ({
  merchantid: merchantId.value
}))

// --------------------------------------------------
// KYC DATA
// --------------------------------------------------

const merchantKYC = ref({
  bo_photoid_status: null as number | string | null,
  bo_poaddress_status: null as number | string | null,
  cd_registration_status: null as number | string | null
})

const userKYC = ref({
  owner_status: null as number | string | null,
  owner_userid: null as string | null
})

// --------------------------------------------------
// MODAL
// --------------------------------------------------

const businessownerTitle = ref('')

const setModalTitle = (title: string) => {
  businessownerTitle.value = title
}

// --------------------------------------------------
// FETCH MERCHANT DETAILS
// --------------------------------------------------

const fetchMerchantDetails = async () => {
  try {
    const response = await ApiService.post('mdb/procedure/GetMerchantDetailsAll', {
      p_merchantid: merchantId.value
    })

    console.log('Merchant details:', response)

    merchantData.value = response?.data?.jsresult ?? null
  } catch (error) {
    console.error('Error fetching merchant details:', error)
  }
}

// --------------------------------------------------
// FETCH MERCHANT KYC
// --------------------------------------------------

const fetchMerchantKYC = async () => {
  try {
    const response = await ApiService.post('/get-merchant-kyc', {
      p_merchantid: merchantId.value

      // Add these when you get them from auth:
      // p_accountid: accountId.value
    })

    console.log('Merchant KYC:', response)

    const data = response?.data

    if (data?.jsresult) {
      merchantKYC.value = {
        bo_photoid_status: data.jsresult.bo_photoidfile_status ?? null,

        bo_poaddress_status: data.jsresult.bo_poaddressfile_status ?? null,

        cd_registration_status: data.jsresult.cd_businessdocument_status ?? null
      }
    }
  } catch (error) {
    console.error('Error fetching merchant KYC:', error)
  }
}

// --------------------------------------------------
// FETCH SIGNUP KYC
// --------------------------------------------------

const fetchSignupKYC = async () => {
  try {
    const response = await ApiService.post('/mdb/procedure/get_SignupKYC', {
      // Add these when you get them from auth:
      // p_quidlyuserid: quidlyUserId.value,
      // p_accountid: accountId.value
    })

    console.log('Signup KYC:', response)

    const data = response?.data?.jsresult

    if (data && data.length > 0) {
      userKYC.value = {
        owner_status: data[0].status ?? null,
        owner_userid: data[0].quidlyuserid ?? null
      }
    }
  } catch (error) {
    console.error('Error fetching signup KYC:', error)
  }
}

// --------------------------------------------------
// INITIAL LOAD
// --------------------------------------------------

onMounted(async () => {
  await Promise.all([fetchMerchantDetails(), fetchMerchantKYC(), fetchSignupKYC()])
})
</script>

<template>
  <main-layout>
    <div class="dashboard">
      <div class="dashboard-container">
        <!-- Page Header -->
        <header class="dashboard-header">
          <h1 class="page-title">KYC Verification</h1>
          <p class="page-subtitle">
            Complete your business and business owner verification to activate your account.
          </p>
        </header>
        <!-- KYC Cards -->
        <section class="kyc-grid">
          <!-- Business KYC -->
          <article class="kyc-card">
            <div class="kyc-card-header">
              <div>
                <h2 class="kyc-title">Business Verification</h2>
                <p class="kyc-subtitle">Verify your business information and documents.</p>
              </div>
              <span class="kyc-badge"> Business </span>
            </div>
            <div class="kyc-divider"></div>
            <div class="kyc-content"></div>
          </article>
          <!-- Business Owner KYC -->
          <article class="kyc-card">
            <div class="kyc-card-header">
              <div>
                <h2 class="kyc-title">Business Owner Verification</h2>
                <p class="kyc-subtitle">
                  Verify the identity and information of the business owner.
                </p>
              </div>
              <span class="kyc-badge"> Owner </span>
            </div>
            <div class="kyc-divider"></div>
            <div class="kyc-content"></div>
          </article>
        </section>
        <!-- Business Information -->
        <section class="information-card">
          <div class="information-header">
            <div>
              <h2 class="information-title">Business Information</h2>
              <p class="information-subtitle">
                Basic information associated with your merchant account.
              </p>
            </div>
          </div>
          <div class="information-grid">
            <div class="information-item">
              <span class="information-label"> Business Name </span>
              <span class="information-value">
                <!-- {{ p_merchantData.merchantname || 'Not provided' }} -->
              </span>
            </div>
            <div class="information-item">
              <span class="information-label"> Company Registration Number </span>
              <span class="information-value">
                <!-- {{ p_merchantData.companyregno || 'Not provided' }} -->
              </span>
            </div>
            <div class="information-item">
              <span class="information-label"> Merchant ID </span>
              <span class="information-value">
                <!-- {{ p_userData.merchantid || 'Not available' }} -->
              </span>
            </div>
            <div class="information-item">
              <span class="information-label"> Account ID </span>
              <!-- <span class="information-value"> {{ p_userData.accountid || 'Not available' }} </span> -->
            </div>
          </div>
        </section>
      </div>
      <!-- Modals -->
    </div>
  </main-layout>
</template>

<style scoped>
/* ========================================================= Dashboard Layout ========================================================= */
.dashboard {
  background: #f8fafc;
  min-height: 100vh;
  padding: 20px;
  font-family: inherit;
}
.dashboard-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
} /* ========================================================= Header ========================================================= */
.dashboard-header {
  margin-bottom: 32px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}
.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
} /* ========================================================= KYC Grid ========================================================= */
.kyc-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 32px;
} /* ========================================================= KYC Card ========================================================= */
.kyc-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
}
.kyc-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
} /* ========================================================= KYC Header ========================================================= */
.kyc-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.kyc-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 5px;
}
.kyc-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}
.kyc-badge {
  flex-shrink: 0;
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #dcfce7;
  border-radius: 20px;
  padding: 5px 11px;
  font-size: 11px;
  font-weight: 600;
} /* ========================================================= Divider ========================================================= */
.kyc-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
} /* ========================================================= KYC Content ========================================================= */
.kyc-content {
  width: 100%;
} /* ========================================================= Business Information ========================================================= */
.information-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.information-header {
  margin-bottom: 24px;
}
.information-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 5px;
}
.information-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}
.information-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}
.information-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}
.information-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}
.information-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
} /* ========================================================= Tablet ========================================================= */
@media (max-width: 1024px) {
  .dashboard {
    padding: 16px;
  }
  .kyc-grid {
    grid-template-columns: 1fr;
  }
  .information-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
} /* ========================================================= Mobile ========================================================= */
@media (max-width: 640px) {
  .dashboard {
    padding: 12px;
  }
  .dashboard-header {
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 12px;
  }
  .kyc-grid {
    gap: 16px;
    margin-bottom: 20px;
  }
  .kyc-card {
    padding: 16px;
  }
  .kyc-card-header {
    gap: 10px;
  }
  .kyc-title {
    font-size: 14px;
  }
  .kyc-subtitle {
    font-size: 12px;
  }
  .kyc-badge {
    font-size: 10px;
    padding: 4px 9px;
  }
  .kyc-divider {
    margin: 16px 0;
  }
  .information-card {
    padding: 16px;
  }
  .information-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
} /* ========================================================= Small Mobile ========================================================= */
@media (max-width: 480px) {
  .dashboard {
    padding: 8px;
  }
  .page-title {
    font-size: 18px;
  }
  .kyc-card {
    padding: 12px;
    border-radius: 10px;
  }
  .kyc-title {
    font-size: 13px;
  }
  .kyc-subtitle {
    font-size: 11px;
  }
  .kyc-badge {
    font-size: 9px;
    padding: 3px 8px;
  }
  .information-card {
    padding: 12px;
    border-radius: 10px;
  }
  .information-title {
    font-size: 13px;
  }
  .information-subtitle {
    font-size: 11px;
  }
  .information-item {
    padding: 12px;
  }
} /* ========================================================= Reduced Motion ========================================================= */
@media (prefers-reduced-motion: reduce) {
  .kyc-card {
    transition: none;
  }
}
</style>
