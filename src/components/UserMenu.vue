<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  variant: {
    type: String,
    default: 'header' // header | sidebar
  }
})

const authStore = useAuthStore()

const { user, merchants, activeMerchant } = storeToRefs(authStore)

/*
|--------------------------------------------------------------------------
| Merchant Menu
|--------------------------------------------------------------------------
*/

const userMenuOpen = ref(false)

// User's full name
const displayName = computed(() => {
  if (!user.value) return 'Merchant Name'

  return `${user.value.fname ?? ''} ${user.value.lname ?? ''}`.trim() || 'Merchant Name'
})

// User role
const displayRole = computed(() => {
  return user.value?.isadmin === 1 ? 'Admin' : 'User'
})

// Current merchant name
const merchantName = computed(() => {
  return activeMerchant.value?.merchantname ?? 'Select Merchant'
})

// User initials
const userInitials = computed(() => {
  const name = displayName.value.trim()

  if (!name) return 'MN'

  return name
    .split(/\s+/)
    .map((name) => name.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

// Merchant initials
const getMerchantInitials = (name: string) => {
  if (!name) return 'M'

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/*
|--------------------------------------------------------------------------
| Switch Merchant
|--------------------------------------------------------------------------
*/

const selectMerchant = (merchantId: string) => {
  console.log('➡️ Selecting merchant:', merchantId)

  authStore.setActiveMerchant(merchantId)

  // Close menu
  merchantMenuOpen.value = false

  console.log('✅ Current merchant:', authStore.activeMerchant?.merchantname)
}

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

const handleProfile = () => {
  userMenuOpen.value = false

  console.log('➡️ Opening profile')

  // If you have a profile route:
  // router.push('/profile')
}

const handleSettings = () => {
  userMenuOpen.value = false

  console.log('➡️ Opening settings')

  // If you have a settings route:
  // router.push('/settings')
}

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

const logout = async () => {
  userMenuOpen.value = false

  try {
    await authStore.logout()
  } catch (error) {
    console.error('❌ Logout failed:', error)
  }
}
</script>
<template>
  <v-menu
    v-model="userMenuOpen"
    :location="variant === 'sidebar' ? 'right center' : 'bottom end'"
    :origin="variant === 'sidebar' ? 'left center' : 'top right'"
    min-width="280"
    :offset="10"
    :close-on-content-click="false"
  >
    <template #activator="{ props: menuProps }">
      <button
        v-bind="menuProps"
        class="user-menu-trigger"
        :class="`user-menu-${variant}`"
        :title="merchantName"
      >
        <!-- Avatar -->
        <div class="user-menu-avatar">
          {{ userInitials }}
        </div>

        <!-- Merchant Info -->
        <div class="user-menu-info">
          <span class="user-menu-merchant">
            {{ merchantName }}
          </span>

          <span class="user-menu-name">
            {{ displayName }}
          </span>
        </div>

        <!-- Settings Icon -->
        <i class="mdi mdi-cog-outline user-menu-chevron rotating-settings"></i>
      </button>
    </template>

    <!-- Main User Menu -->
    <v-list density="compact" class="user-dropdown">
      

      <!-- My Profile -->
      <v-list-item class="dropdown-item" @click="handleProfile">
        <div class="dropdown-item-content">
          <i class="mdi mdi-account-outline"></i>
          <span>My Profile</span>
        </div>
      </v-list-item>

      <!-- Settings -->
      <v-list-item class="dropdown-item" @click="handleSettings">
        <div class="dropdown-item-content">
          <i class="mdi mdi-cog-outline"></i>
          <span>Settings</span>
        </div>
      </v-list-item>

      <!-- Switch Merchant -->
      <!-- Switch Merchant -->
      <v-menu location="end" origin="bottom start" submenu :close-on-content-click="true">
        <template #activator="{ props: switchProps }">
          <v-list-item v-bind="switchProps" class="dropdown-item">
            <div class="dropdown-item-content">
              <i class="mdi mdi-swap-horizontal"></i>

              <span>Switch Merchant</span>

              <i class="mdi mdi-chevron-right switch-chevron"></i>
            </div>
          </v-list-item>
        </template>

        <!-- Merchant List -->
        <v-list min-width="240" class="merchant-switch-menu">
          <div class="merchant-menu-title">Switch Merchant</div>

          <div class="merchant-menu-subtitle">Select a merchant to continue</div>

          <v-divider class="my-2" />

          <v-list-item
            v-for="merchant in merchants"
            :key="merchant.merchantid"
            class="merchant-option"
            :class="{
              'active-merchant': activeMerchant?.merchantid === merchant.merchantid
            }"
            @click="selectMerchant(merchant.merchantid)"
          >
            <div class="merchant-option-content">
              <div class="merchant-avatar">
                {{ getMerchantInitials(merchant.merchantname) }}
              </div>

              <span class="merchant-option-name">
                {{ merchant.merchantname }}
              </span>

              <i
                v-if="activeMerchant?.merchantid === merchant.merchantid"
                class="mdi mdi-check merchant-check"
              ></i>
            </div>
          </v-list-item>

          <div v-if="merchants.length === 0" class="no-merchants">No merchants available</div>
        </v-list>
      </v-menu>

      <v-divider />

      <!-- Logout -->
      <v-list-item class="logout-item" @click="logout">
        <div class="dropdown-item-content">
          <i class="mdi mdi-logout-variant"></i>
          <span>Logout</span>
        </div>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
/* ── Trigger ──────────────────────────────────────────── */

.rotating-settings {
  animation: rotate-settings 4s linear infinite;
}

@keyframes rotate-settings {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.user-menu-trigger {
  width: 100%;

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 7px 8px;

  border: 1px solid #d9dde3;

  border-radius: 12px;

  background: #fff;

  cursor: pointer;

  text-align: left;

  transition: all 0.2s ease;
}

.user-menu-trigger:hover {
  background: #f8f9fa;

  border-color: #cbd5e1;
}

/* ── Header version ───────────────────────────────────── */

.user-menu-header {
  width: auto;

  min-width: 190px;
}

/* ── Sidebar version ──────────────────────────────────── */

.user-menu-sidebar {
  border-radius: 12px;
}

/* ── Avatar ───────────────────────────────────────────── */

.user-menu-avatar {
  width: 38px;

  height: 38px;

  min-width: 38px;

  border-radius: 50%;

  background: #5c8a1f;

  color: #fff;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 12px;

  font-weight: 700;
}

/* ── User info ────────────────────────────────────────── */

.user-menu-info {
  min-width: 0;

  flex: 1;

  display: flex;

  flex-direction: column;
}

.user-menu-merchant {
  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  color: #2b3e50;

  font-size: 12px;

  font-weight: 700;
}

.user-menu-name {
  margin-top: 2px;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  color: #94a3b8;

  font-size: 10px;
}

.user-menu-chevron {
  color: #94a3b8;

  font-size: 18px;
}

/* ── Dropdown ─────────────────────────────────────────── */

.user-dropdown {
  padding: 0 !important;

  border-radius: 14px !important;

  overflow: hidden;
}

.dropdown-user-info {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 15px 16px;
}

.dropdown-avatar {
  width: 40px;

  height: 40px;

  border-radius: 50%;

  background: #f0fdf4;

  color: #5c8a1f;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 12px;

  font-weight: 700;
}

.dropdown-name {
  font-size: 13px;

  font-weight: 700;

  color: #2b3e50;
}

.dropdown-role {
  margin-top: 2px;

  font-size: 11px;

  color: #94a3b8;
}

/* ── Menu Items ───────────────────────────────────────── */

.dropdown-item {
  padding: 0 !important;

  cursor: pointer;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item-content {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 10px 16px;

  color: #64748b;

  font-size: 12px;

  font-weight: 500;
}

.dropdown-item-content > i:first-child {
  font-size: 17px;

  color: #94a3b8;
}

.switch-chevron {
  margin-left: auto;
}

/* ── Switch Account ───────────────────────────────────── */

.merchant-switch-menu {
  padding: 12px 8px !important;

  border-radius: 14px !important;
}

.merchant-menu-title {
  padding: 4px 12px 2px;

  font-size: 13px;

  font-weight: 700;

  color: #2b3e50;
}

.merchant-menu-subtitle {
  padding: 2px 12px 6px;

  font-size: 11px;

  color: #94a3b8;
}

.merchant-option {
  padding: 0 !important;

  border-radius: 8px;

  cursor: pointer;
}

.merchant-option:hover {
  background: #f8f9fa;
}

.merchant-option.active-merchant {
  background: #f0fdf4;
}

.merchant-option-content {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 9px 12px;
}

.merchant-avatar {
  width: 32px;

  height: 32px;

  min-width: 32px;

  border-radius: 9px;

  background: #f0fdf4;

  color: #5c8a1f;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 10px;

  font-weight: 700;
}

.merchant-option-name {
  flex: 1;

  color: #4b5563;

  font-size: 12px;

  font-weight: 600;
}

.merchant-check {
  color: #65a30d;

  font-size: 18px;
}

.active-merchant .merchant-avatar {
  background: #5c8a1f;

  color: #fff;
}

.active-merchant .merchant-option-name {
  color: #5c8a1f;
}

/* ── Logout ───────────────────────────────────────────── */

.logout-item {
  padding: 0 !important;

  cursor: pointer;
}

.logout-item .dropdown-item-content {
  color: #dc2626;
}

.logout-item .dropdown-item-content i {
  color: #dc2626 !important;
}

.logout-item:hover {
  background: #fef2f2;
}
</style>
