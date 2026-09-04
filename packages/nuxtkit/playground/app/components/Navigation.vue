<template>
  <nav class="relative flex h-16 items-center">
    <!-- Left -->
    <div class="flex items-center gap-1.5 lg:flex-1">
      <slot name="left">
        <NuxtLinkLocale
          :to="localePath(AppSymbols.Routes.Root.path)"
          class="flex flex-shrink-0 items-end gap-1.5 text-xl font-bold text-gray-900 dark:text-white"
        >
          NuxtKit
          <UBadge
            label="Playground"
            variant="subtle"
            class="mb-0.5"
          />
        </NuxtLinkLocale>
      </slot>
    </div>

    <!-- Center -->
    <div class="pointer-events-auto absolute top-1/2 left-1/2 flex-none -translate-x-1/2 -translate-y-1/2">
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
    <div class="flex flex-1 items-center justify-end pr-4"></div>
  </nav>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/types';
import { AppSymbols } from '~/symbols';

const { t } = useI18n();
const localePath = useLocalePath();

const items = computed<NavigationMenuItem[]>(() => [
  { label: t('navigation.dashboard'), to: localePath(AppSymbols.Routes.Dashboard.path) },
  { label: t('navigation.complexValidation'), to: localePath(AppSymbols.Routes.Zod.Complex.path) },
]);
</script>
