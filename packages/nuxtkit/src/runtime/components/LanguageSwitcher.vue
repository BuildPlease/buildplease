<template>
  <USelect
    :model-value="currentCode"
    :items="items"
    :disabled="items.length < 2"
    value-key="value"
    color="neutral"
    variant="outline"
    size="sm"
    :ui="{
      base: 'h-10 w-16 shrink-0',
      content: 'min-w-fit',
      item: 'items-center',
      itemWrapper: 'justify-center',
      itemLabel: 'whitespace-nowrap leading-5',
    }"
    :aria-label="`${t('nuxtkit.ui.language')}: ${currentLocale?.label ?? currentCode}`"
    :content="{ side: 'top', align: 'end' }"
    @update:model-value="onSelect"
  >
    <template #default>
      <span
        class="text-base leading-none"
        aria-hidden="true"
        >{{ currentLocale?.flag ?? '🌐' }}</span
      >
    </template>
    <template #item-leading="{ item }">
      <span
        class="inline-flex h-5 shrink-0 items-center text-base leading-none"
        aria-hidden="true"
        >{{ item.flag }}</span
      >
    </template>
  </USelect>
</template>

<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n';
import { computed } from 'vue';

import { useI18n } from '#imports';

interface LanguageItem {
  value: string;
  label: string;
  flag: string;
}

const { locale: currentCode, locales, setLocale, t } = useI18n();

const items = computed<LanguageItem[]>(() => {
  const configured: readonly (string | LocaleObject)[] = locales.value;

  return configured.map((entry) => {
    const locale = typeof entry === 'string' ? { code: entry, language: entry, name: entry } : entry;
    return {
      value: locale.code,
      label: locale.name ?? locale.code,
      flag: flagForLanguage(locale.language ?? locale.code),
    };
  });
});

const currentLocale = computed(() => items.value.find((item) => item.value === currentCode.value));

async function onSelect(code: string): Promise<void> {
  if (code === currentCode.value) return;
  await setLocale(code);
}

function flagForLanguage(language: string): string {
  try {
    const region = new Intl.Locale(language).region;
    if (!region || !/^[A-Z]{2}$/.test(region)) return '🌐';

    return String.fromCodePoint(127397 + region.charCodeAt(0), 127397 + region.charCodeAt(1));
  } catch {
    return '🌐';
  }
}
</script>
