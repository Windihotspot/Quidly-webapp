<template>
  <div class="dash-sidebar">
     <div class="sidebar-logo">
      <!-- Your logo image or text here -->
      <img src="@/assets/images/quidly-logo.png" alt="Logo" class="logo-image" />
      <!-- or use text: -->
      <!-- <h2 class="logo-text">Your App</h2> -->
    </div>
    <ul class="dash-menu mt-8">
      <!-- Main Menu -->
      <template v-for="item in menuItems" :key="item.nav">
        <!-- Parent Menu Item -->
        <li
          :class="{
            active: isActive(item),
            'menu-open': openMenus[item.nav]
          }"
          @click="handleMenuClick(item)"
        >
          <span class="icon-badge">
            <i :class="item.icon"></i>
          </span>

          <span>{{ item.label }}</span>

          <i
            v-if="item.children?.length"
            class="mdi mdi-chevron-down item-chevron"
            :class="{ rotated: openMenus[item.nav] }"
          ></i>
        </li>

        <!-- Dropdown Submenu -->
        <transition name="submenu">
          <div
            v-if="item.children?.length && openMenus[item.nav]"
            class="submenu-wrapper"
          >
            <div class="submenu">
              <router-link
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                class="submenu-link"
                :class="{ active: route.path === child.to }"
              >
                {{ child.label }}
              </router-link>
            </div>
          </div>
        </transition>
      </template>

      

      

     
    </ul>

      <div class="sidebar-user-section">
      <UserMenu variant="sidebar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserMenu from '@/components/UserMenu.vue'
const route = useRoute()
const router = useRouter()

const supportOpen = ref(false)

/*
|--------------------------------------------------------------------------
| Open Dropdown Menus
|--------------------------------------------------------------------------
*/
const openMenus = reactive<Record<string, boolean>>({
  payments: false,
  transactions: false,
  accounts: false,
  settings: false,
})

/*
|--------------------------------------------------------------------------
| Menu Items
|--------------------------------------------------------------------------
*/
const menuItems = [
  {
    nav: 'overview',
    label: 'Dashboard',
    icon: 'mdi mdi-view-dashboard-outline',
    to: '/dashboard',
  },

  {
    nav: 'payments',
    label: 'Payments',
    icon: 'mdi mdi-arrow-top-right',
    to: '/payments',
    children: [
      {
        label: 'Invoices',
        to: '/payments/invoices',
      },
      {
        label: 'Creditlist',
        to: '/payments/creditlist',
      },
    ],
  },

  {
    nav: 'transactions',
    label: 'Transactions',
    icon: 'mdi mdi-format-list-bulleted',
    to: '/transactions',
    children: [
      {
        label: 'Transactions',
        to: '/transactions',
      },
      {
        label: 'Refunds',
        to: '/transactions/refunds',
      },
    ],
  },

  {
    nav: 'accounts',
    label: 'Accounts',
    icon: 'mdi mdi-checkbox-blank-circle-outline',
    to: '/accounts',
    children: [
      {
        label: 'subaccounts',
        to: '/subaccounts',
      },
      {
        label: 'Banks',
        to: '/banks',
      },
      {
        label: 'Settlement',
        to: '/accounts/settlement',
      },
    ],
  },

  {
    nav: 'settings',
    label: 'Settings',
    icon: 'mdi mdi-cog-outline',
    to: '/settings',
    children: [
      {
        label: 'Compliance',
        to: '/settings/compliance',
      },
      {
        label: 'API-keys',
        to: '/settings/api-keys',
      },
      {
        label: 'Profile',
        to: '/settings/profile',
      },
      {
        label: 'Webhook',
        to: '/settings/webhook',
      },
    ],
  },

  {
    nav: 'docs',
    label: 'Documentation',
    icon: 'mdi mdi-book-open-page-variant-outline',
    to: '/docs',
  },
]

/*
|--------------------------------------------------------------------------
| Check Active Menu
|--------------------------------------------------------------------------
*/
const isActive = (item: any) => {
  if (!item.to) return false

  return (
    route.path === item.to ||
    route.path.startsWith(item.to + '/')
  )
}

/*
|--------------------------------------------------------------------------
| Handle Click
|--------------------------------------------------------------------------
*/
const handleMenuClick = (item: any) => {
  // If the item has children, toggle dropdown
  if (item.children?.length) {
    openMenus[item.nav] = !openMenus[item.nav]
    return
  }

  // Normal navigation
  if (item.to) {
    router.push(item.to)
  }
}

/*
|--------------------------------------------------------------------------
| Sign Out
|--------------------------------------------------------------------------
*/
const signOut = async () => {
  // authStore.logout()
  router.push('/')
}
</script>

<style scoped>
/*
|--------------------------------------------------------------------------
| Logo Section
|--------------------------------------------------------------------------
*/
.sidebar-logo {
  flex: 0 0 auto;
  padding: 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.logo-image {
  height: 40px;
  width: auto;
  max-width: 100%;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.dash-sidebar {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 12px 18px 18px;
  background: #fff;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dash-menu {
  list-style: none;
  padding: 0;
  margin: 0;

  flex: 1 1 auto;
  min-height: 0;

  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-user-section {
  flex: 0 0 auto;
  margin-top: 0;
  padding: 12px 0 0;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
/*
|--------------------------------------------------------------------------
| Main Menu Items
|--------------------------------------------------------------------------
*/
.dash-menu > li {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  padding-left: 14px;   /* space for left vertical bar */
  margin-bottom: 10px;
  border-radius: 8px;
  border-left: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.25s ease;
  user-select: none;
}

.dash-menu > li:hover:not(.active) {
  background: #f0fdf4;
  color: #3f6e1f;
}

.dash-menu > li:hover:not(.active) .icon-badge i {
  color: #65a30d;
}

/*
|--------------------------------------------------------------------------
| Active Parent
|--------------------------------------------------------------------------
*/
.dash-menu > li.active {
  background: #f0fdf4;
  border-left-color: #65a30d;
  color: #5c8a1f;
  font-weight: 600;
}

.dash-menu > li.active .icon-badge i {
  color: #65a30d;
}

/*
|--------------------------------------------------------------------------
| Icon
|--------------------------------------------------------------------------
*/
.icon-badge {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.icon-badge i {
  color: #6b7280;
}

/*
|--------------------------------------------------------------------------
| Chevron
|--------------------------------------------------------------------------
*/
.item-chevron {
  margin-left: auto;
  font-size: 17px;
  color: #94a3b8;
  transition: transform 0.25s ease;
}

.item-chevron.rotated {
  transform: rotate(180deg);
}

/*
|--------------------------------------------------------------------------
| SUBMENU WRAPPER

 This creates space between the left edge
 and the vertical line.
|--------------------------------------------------------------------------
*/
.submenu-wrapper {
  /*
    Parent icon starts around 12px + 24px.
    This indentation puts the vertical line
    nicely below the parent item.
  */
  margin: 0 0 8px 34px;

  /*
    Space between the screen/sidebar edge
    and the vertical line.
  */
  padding-left: 14px;

  border-left: 1px solid #d9dde3;
}

/*
|--------------------------------------------------------------------------
| Submenu
|--------------------------------------------------------------------------
*/
.submenu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
}

/*
|--------------------------------------------------------------------------
| Submenu Links
|--------------------------------------------------------------------------
*/
.submenu-link {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 9px 12px;

  color: #64748b;
  text-decoration: none;

  font-size: 12px;
  font-weight: 500;

  border-radius: 8px;

  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.submenu-link:hover {
  background: #f8f9fa;
  color: #334155;
}

.submenu-link.active {
  color: #5c8a1f;
  font-weight: 600;
}

.submenu-link i {
  font-size: 16px;
}

/*
|--------------------------------------------------------------------------
| Divider
|--------------------------------------------------------------------------
*/
.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 12px 0;
}

/*
|--------------------------------------------------------------------------
| Sign Out
|--------------------------------------------------------------------------
*/
.sign-out-item {
  color: #dc2626 !important;
}

.sign-out-item:hover {
  background: #fef2f2 !important;
  color: #b91c1c !important;
}

.sign-out-item .icon-badge i {
  color: #dc2626;
}

/*
|--------------------------------------------------------------------------
| Dropdown Animation
|--------------------------------------------------------------------------
*/
.submenu-enter-active,
.submenu-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/*
|--------------------------------------------------------------------------
| Scrollbar
|--------------------------------------------------------------------------
*/
.dash-menu::-webkit-scrollbar {
  width: 5px;
}

.dash-menu::-webkit-scrollbar-track {
  background: transparent;
}

.dash-menu::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

.dash-menu::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>