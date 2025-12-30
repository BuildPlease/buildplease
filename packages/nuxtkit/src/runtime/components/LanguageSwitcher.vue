<template>
  <UDropdownMenu :items="items">
    <UButton
      variant="outline"
      color="neutral"
      trailing-icon="i-lucide-chevron-down"
    >
      <UIcon
        v-if="currentFlag"
        :name="currentFlag"
        dynamic
      />
      {{ currentLabel }}
    </UButton>

    <template #item="{ item }">
      <UIcon
        v-if="item.icon"
        :name="item.icon"
        dynamic
      />
      <span class="truncate">{{ item.label }}</span>
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DropdownMenuItem } from '@nuxt/ui';

import { useNuxtApp, useRuntimeConfig } from '#app';
import { useCurrentLocale, normalizeLocale } from '#nuxtkit/composables';

type LocaleItem = {
  code: string;
  name?: string;
  flag?: string;
};

const props = withDefaults(
  defineProps<{
    displayFlag?: boolean;
    labelField?: 'code' | 'name';
  }>(),
  {
    displayFlag: true,
    labelField: 'name',
  },
);

const config = useRuntimeConfig();

const availableLocales = computed<LocaleItem[]>(() => {
  const value = config.public.i18n?.locales;

  if (!Array.isArray(value)) return [];

  return value.map((entry) => {
    if (typeof entry === 'string') {
      return {
        code: entry,
        name: entry.toUpperCase(),
        flag: entry.toLowerCase(),
      };
    }

    return {
      code: entry.code,
      name: entry.name,
      flag: (entry as { flag?: string }).flag,
    };
  });
});

const currentCodeFull = useCurrentLocale({ withRegion: true });
const currentCodeBase = computed(() => normalizeLocale(currentCodeFull.value, { preserveRegion: false }));

const currentLocale = computed(() => {
  const matchFull = availableLocales.value.find(
    (locale) => normalizeLocale(locale.code, { preserveRegion: true }) === currentCodeFull.value,
  );
  if (matchFull) return matchFull;

  return availableLocales.value.find(
    (locale) => normalizeLocale(locale.code, { preserveRegion: false }) === currentCodeBase.value,
  );
});

const currentLabel = computed(() => {
  const locale = currentLocale.value;
  if (!locale) return currentCodeFull.value;

  if (props.labelField === 'name') return locale.name ?? locale.code;
  return locale.code;
});

const currentFlag = computed(() => {
  if (!props.displayFlag) return undefined;
  const locale = currentLocale.value;
  if (!locale?.flag) return undefined;
  return `i-flag-${locale.flag}-4x3`;
});

const items = computed<DropdownMenuItem[]>(() => {
  const selected = currentLocale.value?.code;

  return availableLocales.value
    .filter((locale) => locale.code !== selected)
    .map((locale) => ({
      label: props.labelField === 'name' ? (locale.name ?? locale.code) : locale.code,
      to: switchLocalePath(locale.code),
      icon: props.displayFlag && locale.flag ? `i-flag-${locale.flag}-4x3` : undefined,
    }));
});

function switchLocalePath(localeCode: string): string {
  const app = useNuxtApp();
  const fn = app.$switchLocalePath as unknown;
  if (typeof fn === 'function') return (fn as (locale: string) => string)(localeCode);
  return '/';
}
</script>
