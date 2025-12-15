<template>
  <UContainer class="py-10">
    <div class="mx-auto w-full max-w-4xl space-y-8">
      <!-- Welcome -->
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

      <!-- Basic operations -->
      <UCard>
        <template #header>
          <h2 class="text-base font-medium">Basic operations</h2>
        </template>

        <div class="grid gap-3">
          <UButton
            color="info"
            variant="ghost"
            :loading="state.isLoading"
            icon="i-lucide-circle-off"
            @click="onTestUnauthorized"
          >
            Test unauthorized (real redirect)
          </UButton>

          <UButton
            color="warning"
            variant="ghost"
            icon="i-lucide-bug"
            @click="onTestErrorNotifier"
          >
            Test error notifier
          </UButton>
        </div>
      </UCard>

      <!-- Queue test -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <h2 class="text-base font-medium">Operation queue test</h2>
              <p class="mt-0.5 text-sm text-neutral-500">
                Configure operations, run them through secured queue and observe cancellations.
              </p>
            </div>

            <div class="flex shrink-0 gap-2">
              <UButton
                size="sm"
                icon="i-lucide-plus"
                @click="addQueueItem"
              >
                Add
              </UButton>

              <UButton
                size="sm"
                color="error"
                variant="ghost"
                :disabled="state.isRunningTestQueue"
                @click="clearQueue"
              >
                Clear
              </UButton>
            </div>
          </div>
        </template>

        <!-- Setup -->
        <div class="space-y-3">
          <div
            v-for="(item, index) in state.queueTestItems"
            :key="index"
            class="flex flex-wrap items-center gap-3"
          >
            <UBadge variant="subtle">{{ index + 1 }}</UBadge>

            <UInput
              v-model.number="item.input.delayMs"
              type="number"
              placeholder="Delay (ms)"
              class="w-28"
              :disabled="state.isRunningTestQueue"
            />

            <USelect
              v-model="item.input.mode"
              :items="MODE_ITEMS"
              class="w-48"
              :disabled="state.isRunningTestQueue"
            />

            <UBadge
              v-if="item.status !== 'idle'"
              :color="STATUS_COLOR[item.status]"
              variant="subtle"
            >
              {{ item.status }}
            </UBadge>
          </div>
        </div>

        <!-- Controls -->
        <div class="mt-6 flex items-center gap-3">
          <UButton
            color="primary"
            :loading="state.isRunningTestQueue"
            :disabled="state.queueTestItems.length === 0"
            @click="viewModel.executeQueueTest()"
          >
            Run queue
          </UButton>

          <span class="text-sm text-neutral-500"> {{ state.queueTestItems.length }} operations </span>
        </div>

        <!-- Results -->
        <div class="mt-6 space-y-3">
          <UCard
            v-for="(item, index) in state.queueTestItems"
            :key="`result-${index}`"
            variant="outline"
            :ui="{
              root: `border-l-4 ${
                item.status === 'success'
                  ? 'border-l-success'
                  : item.status === 'error'
                    ? 'border-l-error'
                    : item.status === 'running'
                      ? 'border-l-info'
                      : item.status === 'canceled'
                        ? 'border-l-neutral'
                        : 'border-l-neutral'
              }`,
            }"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm text-neutral-500">
                #{{ index + 1 }} · {{ item.input.mode }} · {{ item.input.delayMs }}ms
              </div>

              <UBadge
                :color="STATUS_COLOR[item.status]"
                variant="subtle"
              >
                {{ item.status }}
              </UBadge>
            </div>

            <div class="mt-3 space-y-2">
              <UTextarea
                v-if="item.output"
                :model-value="JSON.stringify(item.output, null, 2)"
                readonly
                autoresize
                class="font-mono text-xs"
              />

              <UTextarea
                v-if="item.error"
                :model-value="String(item.error)"
                readonly
                autoresize
                class="font-mono text-xs text-red-600"
              />
            </div>
          </UCard>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { Symbols } from '@di/symbols';
import type { DashboardViewModel, QueueTestItem } from '@feature/dashboard/view-model';

import type { ButtonProps } from '#ui/types';

type NuxtUiColor = NonNullable<ButtonProps['color']>;
type Mode = QueueTestItem['input']['mode'];

const MODE_ITEMS: Mode[] = ['success', 'unauthorized', 'error'];

const STATUS_COLOR: Record<QueueTestItem['status'], NuxtUiColor> = {
  idle: 'neutral',
  running: 'info',
  success: 'success',
  error: 'error',
  canceled: 'neutral',
};

// MARK: - ViewModel & bindings
const { t } = useI18n();
const router = useRouter();
const localePath = useLocalePath();

const viewModel = useInstance<DashboardViewModel>(Symbols.DI.Feature.Dashboard.ViewModel);

const state = viewModel.state;
useBindViewModel(viewModel);

// MARK: - Navigation
function onGoHome() {
  router.push(localePath(Symbols.Routes.Root.path));
}

// MARK: - Test Operations
async function onTestUnauthorized() {
  await viewModel.executeUnauthorized();
}

function onTestErrorNotifier() {
  useErrorNotifier(new Error('Simulated test error'));
}

// MARK: - Queue Test
function addQueueItem() {
  state.queueTestItems.push({
    input: {
      index: state.queueTestItems.length + 1,
      delayMs: 1500,
      mode: 'success',
    },
    status: 'idle',
  });
}

function clearQueue() {
  state.queueTestItems.length = 0;
}

definePageMeta({ layout: 'logged-in' });
</script>
