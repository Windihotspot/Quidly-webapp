<template>
  <div v-if="authStore.isLoading" class="loading-container">
    <div class="spinner"></div>
    <p>Loading application...</p>
  </div>
  <RouterView v-else />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted, watch, nextTick, provide } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { post } from '@/services/api/api.service'
import router from '@/router'
import AOS from 'aos'

const authStore = useAuthStore()

// Merchant management
const merchant = ref<any>(null)
const merchants = useQuery({
  queryKey: ['merchants', authStore.accountId],
  queryFn: async () => {
    try {
      if (!authStore.user) return []

      const merchants = await authStore.fetchMerchants()
      
      if (merchants && merchants.length > 0) {
        // Try to restore previously selected merchant
        const savedMerchantId = authStore.getActiveMerchant()
        const selectedMerchant = merchants.find(m => m.merchantid === savedMerchantId)
        
        merchant.value = selectedMerchant || merchants[0]
        authStore.setActiveMerchant(merchant.value.merchantid)
      }

      return merchants
    } catch (error) {
      console.error('Failed to fetch merchants:', error)
      return []
    }
  },
  enabled: !!authStore.user,
  refetchOnWindowFocus: false,
  staleTime: 5 * 60 * 1000 // 5 minutes
})

// Provide merchant context to child components
provide('setMerchant', (newMerchant: any) => {
  merchant.value = newMerchant
  authStore.setActiveMerchant(newMerchant.merchantid)
  
  // Reload dashboard if already there
  if (router.currentRoute.value.path === '/dashboard') {
    location.reload()
  } else {
    router.push('/dashboard')
  }
})

provide('merchants', merchants)
provide('merchant', merchant)

// Refetch merchants when user changes
watch(
  () => authStore.user,
  () => {
    merchants.refetch()
  }
)

// Initialize AOS on mount
onMounted(() => {
  nextTick(() => {
    AOS.refresh()
  })
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  font-size: 16px;
  margin: 0;
}
</style>