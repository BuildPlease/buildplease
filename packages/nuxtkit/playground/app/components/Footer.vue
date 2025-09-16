<template>
  <footer class="border-t border-gray-200/50 dark:border-gray-800/60 text-sm">
    <UContainer class="py-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 items-end">
        <!-- Left -->
        <div class="hidden sm:block"></div>

        <!-- Center -->
        <div
          class="justify-self-center text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2"
        >
          <div>
            {{ t('common.copyright', { year }) }}
          </div>
        </div>

        <!-- Right -->
        <div class="justify-self-end self-end mt-4 sm:mt-0">
          <NuxtKitLanguageSwitcher />
        </div>
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n();
const year = new Date().getFullYear();
</script>
