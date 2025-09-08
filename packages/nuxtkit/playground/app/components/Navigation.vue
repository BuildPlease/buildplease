<template>
  <nav class="relative flex h-16 items-center">
    <!-- Left -->
    <div class="flex items-center gap-1.5 lg:flex-1">
      <slot name="left">
        <NuxtLinkLocale
          :to="localePath({ name: Symbols.Routes.Root.name })"
          class="flex flex-shrink-0 items-end gap-1.5 text-xl font-bold text-gray-900 dark:text-white"
        >
          {{ t('brand.name') }}
          <UBadge :label="t('brand.badge')" variant="subtle" class="mb-0.5" />
        </NuxtLinkLocale>
      </slot>
    </div>

    <!-- Center -->
    <div class="flex-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div class="pointer-events-auto">
        <UNavigationMenu
          :items="items"
          orientation="horizontal"
          class="inline-flex"
          :ui="{ root: 'inline-flex', list: 'flex items-center gap-6' }"
        />
      </div>
    </div>

    <!-- Right -->
    <div class="flex-1 flex items-center justify-end pr-4"></div>
  </nav>
</template>

<script setup lang="ts">
import { Symbols } from '@di/symbols';

import type { NavigationMenuItem } from '#ui/types';

const { t } = useI18n();
const localePath = useLocalePath();

const items = computed<NavigationMenuItem[]>(() => [
  { label: t('navigation.dashboard'), to: localePath(Symbols.Routes.Dashboard.path) },
  { label: t('navigation.complexValidation'), to: localePath(Symbols.Routes.Zod.Complex.path) },
  { label: t('navigation.overloadValidation'), to: localePath(Symbols.Routes.Zod.Overload.path) },
]);
</script>
