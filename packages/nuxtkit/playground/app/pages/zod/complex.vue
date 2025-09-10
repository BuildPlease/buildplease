<template>
  <UContainer class="flex-1 flex items-center justify-center py-8">
    <div class="flex flex-col items-center w-full max-w-2xl mb-6">
      <div class="flex items-center justify-between w-full mb-6">
        <div class="flex flex-col items-start w-full">
          <h1 class="text-xl font-semibold">{{ t('navigation.complexValidation') }}</h1>
          <p class="text-sm opacity-70 text-left w-full">
            Strings, numbers, dates, enums, arrays, objects, unions, refine
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UButton size="xs" variant="soft" class="h-10 w-auto whitespace-nowrap" @click="fillInvalid">
            Fill Invalid
          </UButton>
          <UButton size="xs" variant="soft" class="h-10 w-auto whitespace-nowrap" @click="fillValid">
            Fill Valid
          </UButton>
          <UButton size="xs" variant="soft" class="h-10 w-auto whitespace-nowrap" @click="resetForm">
            Reset
          </UButton>
        </div>
      </div>
    </div>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-8 w-full flex flex-col items-center mt-8"
      @submit="onSubmit"
    >
      <UCard class="w-full max-w-2xl mx-auto mb-4 p-6">
        <template #header>
          <h2 class="text-sm font-medium mb-3 opacity-80">String Fields</h2>
        </template>
        <div class="space-y-4">
          <UFormField name="stringFields.stringMin1" label="String Min 1 (min 1 char)">
            <UInput
              v-model="state.stringFields.stringMin1"
              class="w-full"
              placeholder="At least 1 character"
            />
          </UFormField>
          <UFormField name="stringFields.stringMin2" label="String Min 2 (min 2 chars)">
            <UInput
              v-model="state.stringFields.stringMin2"
              class="w-full"
              placeholder="At least 2 characters"
            />
          </UFormField>
          <UFormField name="stringFields.stringMin3" label="String Min 3 (min 3 chars)">
            <UInput
              v-model="state.stringFields.stringMin3"
              class="w-full"
              placeholder="At least 3 characters"
            />
          </UFormField>
          <UFormField name="stringFields.regexLowercased" label="Lowercase Format">
            <UInput
              v-model="state.stringFields.regexLowercased"
              class="w-full"
              placeholder="Lowercase letters only"
            />
          </UFormField>
          <UFormField name="stringFields.regexUppercased" label="Uppercase Format">
            <UInput
              v-model="state.stringFields.regexUppercased"
              class="w-full"
              placeholder="Uppercase letters only"
            />
          </UFormField>
          <UFormField name="stringFields.email" label="Email Format">
            <UInput
              v-model="state.stringFields.email"
              type="email"
              class="w-full"
              placeholder="Valid email"
            />
          </UFormField>
          <UFormField name="stringFields.url" label="URL Format">
            <UInput v-model="state.stringFields.url" type="url" class="w-full" placeholder="Valid URL" />
          </UFormField>
          <UFormField name="stringFields.date" label="Date Format (YYYY-MM-DD)">
            <UInput v-model="state.stringFields.date" class="w-full" placeholder="Valid date (YYYY-MM-DD)" />
          </UFormField>
        </div>
      </UCard>

      <div class="flex justify-center gap-3 mt-6">
        <UButton type="submit" color="primary">Validate</UButton>
      </div>
    </UForm>

    <div v-if="result" class="mt-6 w-full flex flex-col items-center">
      <UAlert v-if="result.ok" color="success" variant="subtle" title="Valid!" class="w-full max-w-sm" />
      <UAlert
        v-else
        color="error"
        variant="soft"
        :title="`Errors (${result.errors.length})`"
        class="w-full max-w-sm"
      />
      <pre class="mt-2 text-xs opacity-80 overflow-auto w-full max-w-sm text-left">{{ resultPretty }}</pre>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { type ComplexDto, complexSchema } from '@schema/complex';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const schema = complexSchema;
const result = ref<{ ok: boolean; errors: any[] } | null>(null);
const resultPretty = computed(() => (result.value ? JSON.stringify(result.value, null, 2) : ''));

// Initial state to reset to
const initialState: ComplexDto = {
  stringFields: {
    stringMin1: '',
    stringMin2: '',
    stringMin3: '',
    regexLowercased: '',
    regexUppercased: '',
    email: '',
    url: '',
    date: '',
  },
};

const state = reactive<ComplexDto>({ ...initialState });

function fillInvalid() {
  Object.assign(state, {
    stringFields: {
      stringMin1: '',
      stringMin2: 'A',
      stringMin3: 'AB',
      regexLowercased: 'ABC',
      regexUppercased: 'abc',
      email: 'not-an-email',
      url: 'not-a-url',
      date: '2023-13',
    },
  });
  validateForm();
}

function fillValid() {
  Object.assign(state, {
    stringFields: {
      stringMin1: 'A',
      stringMin2: 'AB',
      stringMin3: 'ABC',
      regexLowercased: 'abc',
      regexUppercased: 'ABC',
      email: 'test@example.com',
      url: 'https://example.com',
      date: '2023-01-01',
    },
  });
  validateForm();
}

function resetForm() {
  Object.assign(state, { ...initialState });
  result.value = null;
}

function validateForm() {
  const parsed = complexSchema.safeParse(state);
  result.value = parsed.success ? { ok: true, errors: [] } : { ok: false, errors: parsed.error.issues };
}

function onSubmit() {
  const parsed = complexSchema.safeParse(state);
  result.value = parsed.success ? { ok: true, errors: [] } : { ok: false, errors: parsed.error.issues };
}

definePageMeta({ layout: 'logged-in' });
</script>
