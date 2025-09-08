<template>
  <UDropdownMenu :items="items">
    <UButton variant="outline" color="neutral" trailing-icon="i-lucide-chevron-down">
      <UIcon v-if="currentFlag" :name="currentFlag" dynamic />
      {{ currentLabel }}
    </UButton>

    <template #item="{ item }">
      <UIcon v-if="item.icon" :name="item.icon" dynamic />
      <span class="truncate">{{ item.label }}</span>
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DropdownMenuItem } from '@nuxt/ui';
import type { LocaleObject } from '@nuxtjs/i18n';

import { useNuxtApp, useRuntimeConfig } from '#app';
import { useCurrentLocale, normalizeLocale } from '#nuxtkit/composables/use-current-locale';

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

const cfg = useRuntimeConfig();
type RawLocale = string | LocaleObject;
const rawLocales = computed<RawLocale[]>(() => (cfg.public as any)?.i18n?.locales ?? []);

const app = useNuxtApp();
const switchLocalePath = app.$switchLocalePath as (locale: string) => string;

const currentCodeRaw = useCurrentLocale({ withRegion: true });

const currentCodeFull = computed(() => normalizeLocale(currentCodeRaw.value, { preserveRegion: true }));
const currentCodeBase = computed(() => normalizeLocale(currentCodeRaw.value, { preserveRegion: false }));

const allLocales = computed<LocaleObject[]>(() =>
  rawLocales.value.map((l) => (typeof l === 'string' ? { code: l } : l)),
);

const currentLocale = computed(
  () =>
    allLocales.value.find(
      (l) => normalizeLocale(l.code, { preserveRegion: true }) === currentCodeFull.value,
    ) ??
    allLocales.value.find(
      (l) => normalizeLocale(l.code, { preserveRegion: false }) === currentCodeBase.value,
    ),
);

const currentLabel = computed(() =>
  props.labelField === 'name'
    ? (currentLocale.value?.name ?? currentLocale.value?.code ?? currentCodeFull.value)
    : (currentLocale.value?.code ?? currentCodeFull.value),
);

const currentFlag = computed(() => (props.displayFlag ? flagFromCode(currentCodeFull.value) : undefined));

const items = computed<DropdownMenuItem[][]>(() => [
  allLocales.value
    .filter((l) => normalizeLocale(l.code, { preserveRegion: true }) !== currentCodeFull.value)
    .map((l) => ({
      label: props.labelField === 'name' ? (l.name ?? l.code) : l.code,
      to: switchLocalePath(l.code),
      icon: props.displayFlag ? flagFromCode(l.code) : undefined,
    })),
]);

/** Derive a flag icon name from a locale code (prefer region, else base). */
function flagFromCode(code: string): string {
  const full = normalizeLocale(code, { preserveRegion: true }); // e.g. "en-gb"
  const base = normalizeLocale(code, { preserveRegion: false }); // e.g. "en"
  const idx = full.indexOf('-');
  const iso = idx !== -1 ? full.slice(idx + 1) : base;
  return `i-flag-${iso}-4x3`;
}
</script>
