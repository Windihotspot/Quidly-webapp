<script setup>
import { computed, ref } from 'vue'
import { useThemeStore } from '@/stores/useTheme'

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)

const toggleTheme = () => {
  themeStore.toggle()
}

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})

/* Hardcoded for now */
const merchantName = ref('Template Merchant')
const displayName = ref('Template Name')
const displayRole = ref('Administrator')
const userInitials = computed(() => 'TN')

/* Merchant accounts */
const merchants = ref([
  {
    id: 1,
    name: 'Template Merchant',
    initials: 'TM'
  },
  {
    id: 2,
    name: 'Quidly Store',
    initials: 'QS'
  },
  {
    id: 3,
    name: 'Demo Business',
    initials: 'DB'
  }
])

const selectedMerchant = ref(merchants.value[0])

const notifications = ref([
  {
    id: 1,
    title: 'Payment received',
    message: 'A new payment has been successfully received.',
    time: '2 mins ago'
  },
  {
    id: 2,
    title: 'Account updated',
    message: 'Your account information was updated successfully.',
    time: '1 hour ago'
  }
])

const unreadCount = computed(() => notifications.value.length)

const selectMerchant = (merchant) => {
  selectedMerchant.value = merchant
  merchantName.value = merchant.name

  console.log('Switched to:', merchant.name)

  // Later you can load the selected merchant's data here
}

const logout = () => {
  console.log('Logout clicked')

  // Later:
  // authStore.logout()
  // router.push('/')
}
</script>

<template>
  <div class="app-header">
    <!-- Left side -->
    <div class="header-left">
      <div class="page-info m-6">
       
      </div>
    </div>

    <!-- Right: Controls -->
    <div class="header-controls m-2">
      <!-- Live indicator -->
      <div class="live-badge">
        <span class="live-dot"></span>
        <span class="live-text">LIVE</span>
      </div>

      <!-- Date -->
      <div class="date-chip">
        <i class="mdi mdi-calendar-outline"></i>
        <span>{{ formattedDate }}</span>
      </div>

      <!-- Theme toggle -->
      <button
        class="icon-btn"
        @click="toggleTheme"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <i :class="isDark ? 'mdi mdi-weather-sunny' : 'mdi mdi-weather-night'"></i>
      </button>

      <!-- Notifications -->
      <v-menu offset-y location="bottom end" origin="top right" min-width="320">
        <template v-slot:activator="{ props }">
          <button v-bind="props" class="icon-btn notification-btn" title="Notifications">
            <i class="mdi mdi-bell-outline"></i>

            <span v-if="unreadCount" class="notification-dot"></span>
          </button>
        </template>

        <v-list class="notification-menu">
          <!-- Notification header -->
          <div class="notification-header">
            <div>
              <div class="notification-title">Notifications</div>

              <div class="notification-count">{{ unreadCount }} new notifications</div>
            </div>

            <button class="mark-read-btn">Mark all read</button>
          </div>

          <v-divider />

          <!-- Notification items -->
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
          >
            <div class="notification-content">
              <div class="notification-icon">
                <i class="mdi mdi-bell-outline"></i>
              </div>

              <div class="notification-details">
                <div class="notification-item-title">
                  {{ notification.title }}
                </div>

                <div class="notification-message">
                  {{ notification.message }}
                </div>

                <div class="notification-time">
                  {{ notification.time }}
                </div>
              </div>
            </div>
          </v-list-item>

          <v-divider />

          <button class="view-all-btn">View all notifications</button>
        </v-list>
      </v-menu>

      <!-- Avatar -->
      <div class="user-avatar-btn">
        {{ userInitials }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Header ───────────────────────────────────────────── */

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 64px;
  padding: 8px 4px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #2b3e50;
}

.page-subtitle {
  font-size: 12px;
  color: #94a3b8;
}

/* ── Controls ─────────────────────────────────────────── */

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── LIVE badge ───────────────────────────────────────── */

.live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #65a30d;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

.live-text {
  font-size: 11px;
  font-weight: 600;
  color: #5c8a1f;
  letter-spacing: 0.06em;
}

/* ── Date ─────────────────────────────────────────────── */

.date-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  background: #f8f9fa;
  border: 1px solid #d9dde3;
  border-radius: 8px;
  white-space: nowrap;
}

.date-chip i {
  font-size: 16px;
  color: #65a30d;
}

/* ── Icon buttons ─────────────────────────────────────── */

.icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #d9dde3;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  font-size: 18px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f8f9fa;
  border-color: #cbd5e1;
  color: #5c8a1f;
}

/* ── Notification ─────────────────────────────────────── */

.notification-btn:hover {
  color: #5c8a1f;
}

.notification-dot {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 7px;
  height: 7px;
  background: #65a30d;
  border: 2px solid #fff;
  border-radius: 50%;
}

.notification-menu {
  padding: 0 !important;
  border-radius: 14px !important;
  overflow: hidden;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 16px;
}

.notification-title {
  font-size: 14px;
  font-weight: 700;
  color: #2b3e50;
}

.notification-count {
  margin-top: 2px;
  font-size: 11px;
  color: #94a3b8;
}

.mark-read-btn {
  border: none;
  background: transparent;
  color: #5c8a1f;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.mark-read-btn:hover {
  color: #65a30d;
}

.notification-item {
  padding: 0 !important;
  cursor: pointer;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
}

.notification-icon {
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  border-radius: 9px;
  color: #65a30d;
  font-size: 16px;
}

.notification-details {
  min-width: 0;
}

.notification-item-title {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.notification-message {
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.4;
  color: #94a3b8;
}

.notification-time {
  margin-top: 5px;
  font-size: 10px;
  color: #94a3b8;
}

.view-all-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: #fff;
  color: #5c8a1f;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.view-all-btn:hover {
  background: #f8f9fa;
}

/* ── User Avatar ──────────────────────────────────────── */

.user-avatar-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #5c8a1f;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.user-avatar-btn:hover {
  background: #65a30d;
  transform: scale(1.03);
}

/* ── Avatar Dropdown ──────────────────────────────────── */

.avatar-dropdown {
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
  width: 38px;
  height: 38px;
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

/* ── Dropdown Items ───────────────────────────────────── */

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

.dropdown-item-content i {
  font-size: 17px;
  color: #94a3b8;
}

.logout-item {
  padding: 0 !important;
  cursor: pointer;
}

.logout-item .dropdown-item-content {
  color: #dc2626;
}

.logout-item .dropdown-item-content i {
  color: #dc2626;
}

.logout-item:hover {
  background: #fef2f2;
}

/* ── Responsive ───────────────────────────────────────── */

@media (max-width: 768px) {
  .live-badge {
    display: none;
  }

  .date-chip span {
    display: none;
  }

  .date-chip {
    width: 38px;
    height: 38px;
    padding: 0;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-subtitle {
    display: none;
  }

  .header-controls {
    gap: 6px;
  }
}
/* ── Merchant + User Button ───────────────────────────── */

.merchant-user-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 6px 4px 10px;
  background: #fff;
  border: 1px solid #d9dde3;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.merchant-user-btn:hover {
  background: #f8f9fa;
  border-color: #cbd5e1;
}

/* Merchant details */

.merchant-user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 0;
}

.merchant-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
  color: #2b3e50;
}

.merchant-user-role {
  margin-top: 2px;
  font-size: 10px;
  color: #94a3b8;
}

/* Header avatar */

.merchant-user-btn .user-avatar-btn {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  background: #5c8a1f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.merchant-chevron {
  font-size: 17px;
  color: #94a3b8;
}

/* Switch account */

.switch-chevron {
  margin-left: auto;
  font-size: 17px !important;
  color: #94a3b8 !important;
}

.merchant-switch-menu {
  padding: 12px 8px !important;
  border-radius: 14px !important;
  overflow: hidden;
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

/* Merchant option */

.merchant-option {
  padding: 0 !important;
  margin-bottom: 2px;
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
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.merchant-check {
  color: #65a30d;
  font-size: 18px;
}

/* Active merchant */

.active-merchant .merchant-avatar {
  background: #5c8a1f;
  color: #fff;
}

.active-merchant .merchant-option-name {
  color: #5c8a1f;
  font-weight: 700;
}

/* Mobile */

@media (max-width: 768px) {
  .merchant-user-details {
    display: none;
  }

  .merchant-user-btn {
    padding: 4px;
    gap: 4px;
  }

  .merchant-chevron {
    display: none;
  }
}
</style>
