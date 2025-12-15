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
import type { LocaleObject } from '@nuxtjs/i18n';

import { useNuxtApp, useRuntimeConfig } from '#app';
import { useCurrentLocale, normalizeLocale } from '#nuxtkit/composables';

/**
 * Language switcher (KISS).
 * @prop displayFlag Show a flag icon. @default true
 * @prop labelField Which field to display. @default "name"
 */
const props = withDefaults(
  defineProps<{
    /** Show a flag icon. @default true */
    displayFlag?: boolean;
    /** Which field to display. @default "name" */
    labelField?: 'code' | 'name';
  }>(),
  {
    displayFlag: true,
    labelField: 'name',
  },
);

type RawLocale = string | LocaleObject<string>;
const config = useRuntimeConfig();
const rawLocales = computed<RawLocale[]>(() => config.public.i18n?.locales ?? []);
const locales = computed<LocaleObject[]>(() =>
  rawLocales.value.map((locale) =>
    typeof locale === 'string'
      ? { code: locale, name: locale.toUpperCase(), flag: locale.toLowerCase() }
      : locale,
  ),
);

const currentCodeFull = useCurrentLocale({ withRegion: true });
const currentCodeBase = computed(() => normalizeLocale(currentCodeFull.value, { preserveRegion: false }));
const currentFlag = computed(() => (props.displayFlag ? makeFlag(currentLocale.value?.code) : undefined));

const currentLocale = computed(() => {
  return (
    locales.value.find(
      (locale) => normalizeLocale(locale.code, { preserveRegion: true }) === currentCodeFull.value,
    ) ??
    locales.value.find(
      (locale) => normalizeLocale(locale.code, { preserveRegion: false }) === currentCodeBase.value,
    )
  );
});

const currentLabel = computed(() =>
  props.labelField === 'name'
    ? (currentLocale.value?.name ?? currentLocale.value?.code ?? currentCodeFull.value)
    : (currentLocale.value?.code ?? currentCodeFull.value),
);

const items = computed<DropdownMenuItem[]>(() =>
  locales.value
    .filter((locale) => locale.code !== currentLocale.value?.code)
    .map((locale) => ({
      label: props.labelField === 'name' ? (locale.name ?? locale.code) : locale.code,
      to: onSwitchLocale(locale.code),
      icon: props.displayFlag ? makeFlag(locale.code) : undefined,
    })),
);

function makeFlag(code?: string): string | undefined {
  const locale = locales.value.find((l) => l.code === code);
  const flag = locale?.flag;
  return flag ? `i-flag-${flag}-4x3` : undefined;
}

function onSwitchLocale(localeCode: string): string {
  const app = useNuxtApp();
  const switchLocalePath = app.$switchLocalePath as (locale: string) => string;

  return switchLocalePath(localeCode);
}
</script>
