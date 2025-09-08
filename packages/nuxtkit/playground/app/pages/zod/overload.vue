<template>
  <UContainer class="flex-1 flex items-center justify-center py-8">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold">{{ t('navigation.overloadValidation') }}</h1>
          <UButton size="xs" variant="soft" @click="reset">Reset</UButton>
        </div>
        <p class="text-sm opacity-70">Simple shape to surface errors fast</p>
      </template>

      <UForm :schema="schema" :state="state" class="grid gap-4" @submit="onSubmit">
        <UFormField name="email" label="Email">
          <UInput v-model="state.email" type="email" />
        </UFormField>

        <UFormField name="username" label="Username">
          <UInput v-model="state.username" />
        </UFormField>

        <UFormField name="age" label="Age (18+)">
          <UInput v-model.number="state.age" type="number" />
        </UFormField>

        <UFormField name="terms" label="Accept Terms">
          <UCheckbox v-model="state.terms" />
        </UFormField>

        <div class="flex items-center gap-3">
          <UButton type="submit" color="primary">Validate</UButton>
          <UButton variant="ghost" @click="fillDemoInvalid">Fill invalid</UButton>
        </div>
      </UForm>

      <div v-if="result" class="mt-6">
        <UAlert v-if="result.ok" color="success" variant="subtle" title="Valid!" />
        <UAlert v-else color="error" variant="soft" :title="`Errors (${result.errors.length})`" />
        <pre class="mt-2 text-xs opacity-80 overflow-auto">{{ resultPretty }}</pre>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';

import { OverloadSchema } from '@schema/overload';
const { t } = useI18n();

const schema = OverloadSchema;

const state = reactive({
  email: '',
  username: '',
  age: 0,
  terms: false,
});

const result = ref<{ ok: boolean; errors: any[] } | null>(null);
const resultPretty = computed(() => (result.value ? JSON.stringify(result.value, null, 2) : ''));

function onSubmit() {
  const parsed = schema.safeParse(state);
  result.value = parsed.success ? { ok: true, errors: [] } : { ok: false, errors: parsed.error.issues };
}

function reset() {
  Object.assign(state, { email: '', username: '', age: 0, terms: false });
  result.value = null;
}

function fillDemoInvalid() {
  Object.assign(state, { email: 'nope', username: 'x', age: 12, terms: false });
  result.value = null;
}

definePageMeta({ layout: 'logged-in' });
</script>
