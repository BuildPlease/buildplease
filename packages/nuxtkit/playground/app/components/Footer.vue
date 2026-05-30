<template>
  <footer class="border-t border-gray-200/50 text-sm dark:border-gray-800/60">
    <UContainer class="py-6">
      <div class="grid grid-cols-1 items-end sm:grid-cols-3">
        <!-- Left -->
        <div class="hidden sm:block"></div>

        <!-- Center -->
        <div class="flex flex-col items-center gap-2 justify-self-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            {{ t('common.copyright', { year }) }}
          </div>
        </div>

        <!-- Right -->
        <div class="mt-4 self-end justify-self-end sm:mt-0">
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
