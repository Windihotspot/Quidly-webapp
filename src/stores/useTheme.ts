import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDark = ref(false)

    function applyTheme(dark: boolean) {
      document.documentElement.classList.toggle('dark', dark)
    }

    function toggle() {
      const el = document.documentElement
      el.classList.add('theme-switching')
      isDark.value = !isDark.value
      window.setTimeout(() => el.classList.remove('theme-switching'), 350)
    }

    // Sync html class whenever isDark changes (including on hydration from localStorage)
    watch(isDark, applyTheme, { immediate: true })

    return { isDark, toggle }
  },
  { persist: true }
)
