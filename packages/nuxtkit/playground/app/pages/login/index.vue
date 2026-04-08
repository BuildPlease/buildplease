<template>
  <UContainer class="flex flex-1 items-center justify-center py-8">
    <UCard class="w-full max-w-md shadow-lg">
      <template #header>
        <div class="flex items-center justify-center gap-2">
          <UIcon
            name="i-lucide-lock"
            class="h-6 w-6"
          />
          <h1 class="text-2xl font-semibold">{{ t('page.login.title') }}</h1>
        </div>
      </template>

      <UForm
        :schema="loginSchema"
        :state="state"
        class="w-full space-y-5"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('common.email')"
          name="email"
          class="w-full"
        >
          <UInput
            v-model="state.email"
            type="email"
            size="lg"
            class="w-full"
            :placeholder="t('placeholder.email')"
          />
        </UFormField>

        <UFormField
          :label="t('common.password')"
          name="password"
          class="w-full"
        >
          <UInput
            v-model="state.password"
            type="password"
            size="lg"
            class="w-full"
            :placeholder="t('placeholder.password')"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          color="primary"
          :loading="state.isLoading"
        >
          {{ t('page.login.button') }}
        </UButton>

        <UAlert
          v-if="state.error"
          color="error"
          variant="soft"
          :title="state.error"
        />
      </UForm>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { Symbols } from '@di/symbols';
import type { LoginViewModel } from '@feature/login/view-model';
import { type LoginDto, loginSchema } from '@schema';

import type { FormSubmitEvent } from '#ui/types';

const { t } = useI18n();
const viewModel = useInstance<LoginViewModel>(Symbols.DI.Feature.Login.ViewModel);
const state = viewModel.state;

useBindViewModel(viewModel);

async function onSubmit(event: FormSubmitEvent<LoginDto>) {
  await viewModel.onSubmit(event.data);
}
</script>
