<template>
  <UContainer class="flex items-center justify-center">
    <UCard class="w-full max-w-md space-y-6 text-center">
      <template #header>
        <h1 class="text-2xl font-semibold">{{ t('page.home.title') }}</h1>
      </template>

      <p class="text-gray-600">
        {{ t('page.home.description') }}
      </p>

      <template #footer>
        <UButton
          block
          size="lg"
          color="primary"
          :to="localePath(AppSymbols.Routes.Login.path)"
          :label="t('common.login')"
        />
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { AppSymbols } from '~/symbols';

const { t } = useI18n();
const localePath = useLocalePath();
</script>
