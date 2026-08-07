<template>
  <UDropdownMenu :items="items">
    <UButton
      variant="outline"
      color="neutral"
    >
      <span v-if="currentFlag">{{ currentFlag }}</span>
      {{ currentLabel }}
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import type { LocaleObject } from '@nuxtjs/i18n';
import { computed } from 'vue';

import { useI18n } from '#imports';

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

const { locale: currentCode, locales, setLocale } = useI18n();

const availableLocales = computed<LocaleObject[]>(() => {
  const configuredLocales: readonly (string | LocaleObject)[] = locales.value;

  return configuredLocales.map((locale) =>
    typeof locale === 'string'
      ? {
          code: locale,
          language: locale,
          name: locale.toUpperCase(),
        }
      : locale,
  );
});

const currentLocale = computed(() => availableLocales.value.find((locale) => locale.code === currentCode.value));

const currentLabel = computed(() => {
  const locale = currentLocale.value;
  if (!locale) return currentCode.value;

  return props.labelField === 'name' ? (locale.name ?? locale.code) : locale.code;
});

const currentFlag = computed(() => {
  if (!props.displayFlag || !currentLocale.value) return undefined;
  return getFlag(currentLocale.value);
});

const items = computed<DropdownMenuItem[]>(() =>
  availableLocales.value
    .filter((locale) => locale.code !== currentCode.value)
    .map((locale) => {
      const label = props.labelField === 'name' ? (locale.name ?? locale.code) : locale.code;
      const flag = props.displayFlag ? getFlag(locale) : undefined;

      return {
        label: flag ? `${flag} ${label}` : label,
        onSelect: async () => {
          await setLocale(locale.code);
        },
      };
    }),
);

function getFlag(locale: LocaleObject): string | undefined {
  if (!locale.language) return undefined;

  const region = new Intl.Locale(locale.language).region;
  if (!region || region.length !== 2) return undefined;

  return String.fromCodePoint(...Array.from(region.toUpperCase()).map((character) => 127397 + character.charCodeAt(0)));
}
</script>
