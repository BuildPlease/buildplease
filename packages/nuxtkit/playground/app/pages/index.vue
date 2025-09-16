<template>
  <UContainer class="flex items-center justify-center">
    <UCard class="max-w-md w-full text-center space-y-6">
      <template #header>
        <h1 class="text-2xl font-semibold">{{ t('pages.home.title') }}</h1>
      </template>

      <p class="text-gray-600">
        {{ t('pages.home.description') }}
      </p>

      <template #footer>
        <UButton
          block
          size="lg"
          color="primary"
          :to="localePath({ name: Symbols.Routes.Login.name })"
          :label="t('common.login')"
        />
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { Symbols } from '@di/symbols';
const { t } = useI18n();
const localePath = useLocalePath();
</script>
