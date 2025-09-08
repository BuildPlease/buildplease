<template>
  <UContainer class="pt-10 pb-4">
    <div class="max-w-md mx-auto space-y-8">
      <!-- Welcome Card -->
      <UCard class="text-center">
        <h1 class="text-2xl font-semibold">{{ t('pages.dashboard.welcomeBack') }}</h1>
        <p class="mt-1 text-sm">{{ t('pages.dashboard.loginSuccess') }}</p>

        <div class="mt-6">
          <UButton
            block
            size="lg"
            color="primary"
            icon="i-heroicons-arrow-left"
            :disabled="state.isLoading"
            @click="onGoHome"
          >
            {{ t('pages.dashboard.goHome') }}
          </UButton>
        </div>
      </UCard>

      <!-- Operations -->
      <UCard>
        <template #header>
          <h2 class="text-base font-medium">{{ t('pages.dashboard.operations') }}</h2>
        </template>

        <div class="grid gap-3">
          <UButton
            color="info"
            variant="ghost"
            :loading="state.isLoading"
            icon="i-heroicons-no-symbol"
            @click="onTestUnauthorized"
          >
            {{ t('pages.dashboard.testUnauthorized') }}
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { Symbols } from '@di/symbols';
import type { DashboardViewModel } from '@feature/dashboard/view-model';

const { t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

const viewmodel = useInstance<DashboardViewModel>(Symbols.DI.Feature.Dashboard.ViewModel);
const state = viewmodel.state;

function onGoHome() {
  router.push(localePath(Symbols.Routes.Root.path));
}

async function onTestUnauthorized() {
  await viewmodel.executeUnauthorized();
}

definePageMeta({ layout: 'logged-in' });
</script>
