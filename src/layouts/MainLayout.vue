<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useDisplay } from 'vuetify'

import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const { mdAndUp } = useDisplay()

const drawer = ref(false)

onMounted(() => {
  drawer.value = mdAndUp.value
})

watchEffect(() => {
  drawer.value = mdAndUp.value
})

const toggleDrawer = () => {
  drawer.value = !drawer.value
}
</script>

<template>
  <v-app>
    <!-- SIDEBAR -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="mdAndUp"
      :temporary="!mdAndUp"
      width="260"
      class="side-bar"
    >
      <Sidebar class=""/>
    </v-navigation-drawer>

    <!-- HEADER: separate from sidebar -->
    <v-app-bar
      elevation="0"
      class="app-topbar"
    >
      <!-- Mobile menu button -->
      <v-app-bar-nav-icon
        v-if="!mdAndUp"
        @click="toggleDrawer"
      />

      <!-- This is your breadcrumbs/header -->
      <Navbar />
    </v-app-bar>

    <!-- PAGE CONTENT -->
    <v-main class="page-main">
      <v-container fluid class="page-wrapper">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
/* TOP HEADER */
.app-topbar {
  background: #ffffff !important;
  border-bottom: 1px solid #e5e7eb !important;
  box-shadow: none !important;
}

/* Make Navbar fill the available header space */
.app-topbar :deep(.app-header) {
  width: 100%;
}

/* SIDEBAR */
.side-bar {
  border: none !important;
  background: #ffffff !important;
}

.side-bar :deep(.v-navigation-drawer__content) {
  background: #ffffff;
  overflow-y: auto;
}

/* MAIN PAGE */
.page-main {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-wrapper {
  padding: 24px !important;
  background: #f8f9fa;
}
</style>