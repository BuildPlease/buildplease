<template>
  <div
    role="group"
    :aria-label="t('nuxtkit.ui.appearance')"
    class="bg-default ring-accented inline-flex h-10 items-center gap-0.5 rounded-md p-0.5 ring ring-inset"
  >
    <ClientOnly>
      <UButton
        v-for="option in options"
        :key="option.value"
        :icon="option.icon"
        :aria-label="t(option.labelKey)"
        :title="t(option.labelKey)"
        :aria-pressed="colorMode.preference === option.value"
        :variant="colorMode.preference === option.value ? 'soft' : 'ghost'"
        :disabled="!!colorMode.forced"
        color="neutral"
        size="sm"
        class="size-8 justify-center p-0"
        @click="colorMode.preference = option.value"
      />
      <template #fallback>
        <UButton
          v-for="option in options"
          :key="option.value"
          :icon="option.icon"
          :aria-label="t(option.labelKey)"
          :title="t(option.labelKey)"
          :aria-pressed="option.value === 'system'"
          :variant="option.value === 'system' ? 'soft' : 'ghost'"
          color="neutral"
          size="sm"
          class="size-8 justify-center p-0"
          disabled
        />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useColorMode, useI18n } from '#imports';

const colorMode = useColorMode();
const { t } = useI18n();

const options = [
  { value: 'light', labelKey: 'nuxtkit.ui.light', icon: 'i-lucide-sun' },
  { value: 'system', labelKey: 'nuxtkit.ui.system', icon: 'i-lucide-monitor' },
  { value: 'dark', labelKey: 'nuxtkit.ui.dark', icon: 'i-lucide-moon' },
] as const;
</script>
