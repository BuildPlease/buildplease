<template>
  <footer class="border-default text-muted border-t text-xs">
    <UContainer class="py-5">
      <div class="flex flex-wrap items-start justify-between gap-6 pb-5">
        <div class="space-y-1">
          <NuxtLinkLocale
            :to="localePath(Routes.Root.path)"
            class="text-default font-semibold"
          >
            NuxtKit
          </NuxtLinkLocale>
          <p>Playground</p>
        </div>
        <nav
          aria-label="NuxtKit"
          class="flex flex-wrap gap-x-5 gap-y-2"
        >
          <NuxtLinkLocale
            :to="localePath(Routes.Root.path)"
            class="hover:text-default"
          >
            {{ t('page.home.title') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale
            :to="localePath(Routes.Dashboard.path)"
            class="hover:text-default"
          >
            {{ t('navigation.dashboard') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale
            :to="localePath(Routes.Zod.Complex.path)"
            class="hover:text-default"
          >
            {{ t('navigation.complexValidation') }}
          </NuxtLinkLocale>
        </nav>
      </div>

      <div class="border-default flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <p>{{ t('common.copyright', { year }) }}</p>
        <div class="flex items-center gap-2">
          <NuxtKitColorModeSwitcher />
          <NuxtKitLanguageSwitcher />
        </div>
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
import { Routes } from '~/symbols';

const { t } = useI18n();
const localePath = useLocalePath();
const year = new Date().getFullYear();
</script>
