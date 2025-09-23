<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <div class="flex min-h-dvh flex-col">
        <NuxtPage
          class="flex flex-1 flex-col"
          :transition="{ onBeforeEnter }"
        />
      </div>

      <Footer />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();
const { finalizePendingLocaleChange } = useI18n();

async function onBeforeEnter() {
  await finalizePendingLocaleChange();
}
</script>
