<template>
  <div v-if="authStore.isAdmin">
    <slot />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>