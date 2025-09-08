<template>
  <UApp>
    <NuxtLayout class>
      <div class="min-h-dvh flex flex-col">
        <NuxtPage class="flex-1 flex flex-col" :transition="{ onBeforeEnter }" />
      </div>

      <!-- Footer -->
      <Footer />
    </NuxtLayout>
  </UApp>

  <!-- Global notifications (unchanged) -->
  <div class="notifications">
    <div v-for="n in items" :key="n.id" class="notification" :class="n.type" role="alert">
      <span>{{ n.message }}</span>
      <button class="close" @click="remove(n.id)" aria-label="Dismiss">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, remove } = useNotifications();
const { finalizePendingLocaleChange } = useI18n();

async function onBeforeEnter() {
  await finalizePendingLocaleChange();
}
</script>
