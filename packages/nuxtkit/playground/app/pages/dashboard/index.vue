<template>
  <UPage class="py-10">
    <div class="mx-auto w-full max-w-5xl space-y-8">
      <UCard class="text-center">
        <h1 class="text-2xl font-semibold">
          {{ t('page.dashboard.welcomeBack') }}
        </h1>

        <p class="mt-1 text-sm">
          {{ t('page.dashboard.loginSuccess') }}
        </p>

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

      <UCard>
        <template #header>
          <h2 class="text-base font-medium">
            {{ t('page.dashboard.sections.basicOperations.title') }}
          </h2>
        </template>

        <div class="grid gap-3">
          <UButton
            color="info"
            variant="ghost"
            :loading="state.isLoading"
            icon="i-lucide-circle-off"
            @click="onTestUnauthorized"
          >
            {{ t('operation.action.testUnauthorized') }}
          </UButton>

          <UButton
            color="warning"
            variant="ghost"
            icon="i-lucide-bug"
            @click="onTestErrorNotifier"
          >
            {{ t('operation.action.testErrorNotifier') }}
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-4">
            <div>
              <h2 class="text-base font-medium">
                {{ t('page.dashboard.sections.httpRequests.title') }}
              </h2>

              <p class="mt-0.5 max-w-3xl text-sm text-neutral-500">
                {{ t('page.dashboard.sections.httpRequests.description') }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="preset in PRESETS"
                :key="preset"
                size="md"
                color="primary"
                :variant="state.httpRequestPreset === preset ? 'solid' : 'soft'"
                class="font-medium"
                :disabled="state.isRunningHttpRequestTest"
                @click="viewModel.applyHttpRequestPreset(preset)"
              >
                {{ t(PRESET_LABEL_KEY[preset]) }}
              </UButton>
            </div>
          </div>
        </template>

        <div class="border-default overflow-hidden rounded-lg border">
          <div
            class="border-default bg-elevated/50 hidden grid-cols-[3rem_8rem_8rem_10rem_1fr_auto] gap-3 border-b px-4 py-2 text-xs font-medium text-neutral-500 md:grid"
          >
            <span>#</span>
            <span>{{ t('operation.input.startDelayMs') }}</span>
            <span>{{ t('operation.input.delayMs') }}</span>
            <span>{{ t('operation.label.response') }}</span>
            <span>{{ t('operation.label.lifecycle') }}</span>
            <span>{{ t('operation.label.result') }}</span>
          </div>

          <div
            v-for="(item, index) in state.httpRequestItems"
            :key="index"
            class="border-default grid gap-3 border-b px-4 py-4 last:border-b-0 md:grid-cols-[3rem_8rem_8rem_10rem_1fr_auto] md:items-center"
          >
            <div class="flex items-center justify-between gap-3 md:block">
              <span class="text-sm font-semibold">#{{ index + 1 }}</span>
              <UBadge
                class="md:hidden"
                :color="STATUS_COLOR[item.status]"
                variant="subtle"
              >
                {{ t(STATUS_LABEL_KEY[item.status]) }}
              </UBadge>
            </div>

            <UInput
              v-model.number="item.startDelayMs"
              type="number"
              min="0"
              size="sm"
              :disabled="state.isRunningHttpRequestTest"
            />

            <UInput
              v-model.number="item.input.delayMs"
              type="number"
              min="0"
              size="sm"
              :disabled="state.isRunningHttpRequestTest"
            />

            <USelect
              v-model="item.input.mode"
              :items="modeItems"
              size="sm"
              :disabled="state.isRunningHttpRequestTest"
            />

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-neutral-500">
                <span :class="item.enteredAtMs === undefined && 'opacity-40'">
                  ENTER {{ formatTime(item.enteredAtMs) }}
                </span>
                <span>→</span>
                <span :class="item.requestStartedAtMs === undefined && 'opacity-40'">
                  HTTP {{ formatTime(item.requestStartedAtMs) }}
                </span>
                <span>→</span>
                <span :class="item.finishedAtMs === undefined && 'opacity-40'">
                  DONE {{ formatTime(item.finishedAtMs) }}
                </span>
              </div>

              <p
                v-if="item.error"
                class="mt-1 truncate text-xs text-neutral-500"
                :title="formatError(item.error)"
              >
                {{ formatError(item.error) }}
              </p>
              <p
                v-else-if="item.output"
                class="mt-1 truncate text-xs text-neutral-500"
              >
                {{ item.output.message }}
              </p>
            </div>

            <UBadge
              class="hidden md:inline-flex"
              :color="STATUS_COLOR[item.status]"
              variant="subtle"
            >
              {{ t(STATUS_LABEL_KEY[item.status]) }}
            </UBadge>
          </div>
        </div>

        <div class="mt-5 flex justify-center">
          <UButton
            color="primary"
            size="lg"
            icon="i-lucide-play"
            :loading="state.isRunningHttpRequestTest"
            :disabled="state.httpRequestItems.length === 0"
            @click="onRunHttpRequestTest"
          >
            {{ t('operation.action.runHttpRequests') }}
          </UButton>
        </div>
      </UCard>
    </div>
  </UPage>
</template>

<script setup lang="ts">
import type { ButtonProps } from '#ui/types';
import { Symbols } from '~/di/symbols';
import { type DashboardViewModel, HttpRequestPreset, HttpRequestTestStatus } from '~/feature/dashboard/view-model';
import { HttpRequestTestMode } from '~/networking/operation/http-request-test';

type ButtonColor = NonNullable<ButtonProps['color']>;

const PRESETS: HttpRequestPreset[] = [
  HttpRequestPreset.AllSuccess,
  HttpRequestPreset.ErrorMiddle,
  HttpRequestPreset.UnauthorizedFirst,
  HttpRequestPreset.UnauthorizedMiddle,
  HttpRequestPreset.UnauthorizedLast,
  HttpRequestPreset.UnauthorizedDelayed,
];

const MODES: HttpRequestTestMode[] = [
  HttpRequestTestMode.Success,
  HttpRequestTestMode.Unauthorized,
  HttpRequestTestMode.Error,
];

const PRESET_LABEL_KEY: Record<HttpRequestPreset, string> = {
  [HttpRequestPreset.AllSuccess]: 'operation.preset.allSuccess',
  [HttpRequestPreset.ErrorMiddle]: 'operation.preset.errorMiddle',
  [HttpRequestPreset.UnauthorizedFirst]: 'operation.preset.unauthorizedFirst',
  [HttpRequestPreset.UnauthorizedMiddle]: 'operation.preset.unauthorizedMiddle',
  [HttpRequestPreset.UnauthorizedLast]: 'operation.preset.unauthorizedLast',
  [HttpRequestPreset.UnauthorizedDelayed]: 'operation.preset.unauthorizedDelayed',
};

const STATUS_LABEL_KEY: Record<HttpRequestTestStatus, string> = {
  [HttpRequestTestStatus.Idle]: 'operation.status.idle',
  [HttpRequestTestStatus.Waiting]: 'operation.status.waiting',
  [HttpRequestTestStatus.Running]: 'operation.status.running',
  [HttpRequestTestStatus.Success]: 'operation.status.success',
  [HttpRequestTestStatus.Error]: 'operation.status.error',
  [HttpRequestTestStatus.Unauthorized]: 'operation.status.unauthorized',
  [HttpRequestTestStatus.Canceled]: 'operation.status.canceled',
};

const MODE_LABEL_KEY: Record<HttpRequestTestMode, string> = {
  [HttpRequestTestMode.Success]: 'operation.status.success',
  [HttpRequestTestMode.Unauthorized]: 'operation.status.unauthorized',
  [HttpRequestTestMode.Error]: 'operation.status.error',
};

const STATUS_COLOR: Record<HttpRequestTestStatus, ButtonColor> = {
  [HttpRequestTestStatus.Idle]: 'neutral',
  [HttpRequestTestStatus.Waiting]: 'warning',
  [HttpRequestTestStatus.Running]: 'info',
  [HttpRequestTestStatus.Success]: 'success',
  [HttpRequestTestStatus.Error]: 'error',
  [HttpRequestTestStatus.Unauthorized]: 'warning',
  [HttpRequestTestStatus.Canceled]: 'neutral',
};

const { t } = useI18n();
const modeItems = computed(() =>
  MODES.map((value) => ({
    label: t(MODE_LABEL_KEY[value]),
    value: value,
  })),
);
const router = useRouter();
const localePath = useLocalePath();

const viewModel = useInstance<DashboardViewModel>(Symbols.DI.Feature.Dashboard.ViewModel);
const notifyError = useErrorNotifier();
const state = viewModel.state;

useBindViewModel(viewModel);

function onGoHome() {
  router.push(localePath(Symbols.Routes.Root.path));
}

async function onTestUnauthorized() {
  await viewModel.executeUnauthorized();
}

function onTestErrorNotifier() {
  notifyError(new Error('Simulated test error'));
}

async function onRunHttpRequestTest() {
  await viewModel.executeHttpRequestTest();
}

function formatTime(value: number | undefined): string {
  return value === undefined ? '—' : `+${value}ms`;
}

function formatError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

definePageMeta({ layout: 'logged-in' });
</script>
