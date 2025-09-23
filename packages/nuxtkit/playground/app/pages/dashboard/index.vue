<template>
  <UContainer class="flex items-center pt-10">
    <div class="w-full max-w-4xl space-y-8 px-4">
      <!-- Welcome Card -->
      <UCard class="text-center">
        <h1 class="text-2xl font-semibold">{{ t('page.dashboard.welcomeBack') }}</h1>
        <p class="mt-1 text-sm">{{ t('page.dashboard.loginSuccess') }}</p>

        <div class="mt-6">
          <UButton
            block
            size="lg"
            color="primary"
            icon="i-lucide-arrow-left"
            :disabled="state.isLoading"
            @click="onGoHome"
          >
            {{ t('page.dashboard.goHome') }}
          </UButton>
        </div>
      </UCard>

      <!-- Operations -->
      <UCard>
        <template #header>
          <h2 class="text-base font-medium">{{ t('page.dashboard.operations') }}</h2>
        </template>

        <div class="grid gap-3">
          <UButton
            color="info"
            variant="ghost"
            :loading="state.isLoading"
            icon="i-lucide-circle-off"
            @click="onTestUnauthorized"
          >
            {{ t('page.dashboard.testUnauthorized') }}
          </UButton>

          <UButton
            color="warning"
            variant="ghost"
            :loading="state.isLoading"
            icon="i-lucide-bug"
            @click="onTestError"
          >
            {{ t('page.dashboard.testErrorNotifier') }}
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

async function onTestError() {
  try {
    throw new Error('Simulated test error');
  } catch (error) {
    useErrorNotifier(error);
  }
}

definePageMeta({ layout: 'logged-in' });
</script>
