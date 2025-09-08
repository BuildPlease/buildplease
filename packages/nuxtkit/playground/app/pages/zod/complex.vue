<template>
  <UContainer class="flex-1 flex items-center justify-center py-8">
    <!-- Main Section Title and Buttons -->
    <div class="flex flex-col items-center w-full max-w-2xl mb-6">
      <div class="flex items-center justify-between w-full mb-6">
        <div class="flex flex-col items-start w-full">
          <h1 class="text-xl font-semibold">{{ t('navigation.complexValidation') }}</h1>
          <p class="text-sm opacity-70 text-left w-full">
            Strings, numbers, dates, enums, arrays, objects, unions, refine
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UButton size="xs" variant="soft" class="h-10 w-auto whitespace-nowrap" @click="fillDemo">
            Fill demo
          </UButton>
          <UButton size="xs" variant="soft" class="h-10 w-auto whitespace-nowrap" @click="reset">
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
      <!-- Basics Card -->
      <UCard class="w-full max-w-2xl mx-auto mb-4 p-6">
        <template #header>
          <div class="flex justify-between w-full">
            <h2 class="text-sm font-medium mb-3 opacity-80">Basics</h2>
          </div>
        </template>
        <div class="space-y-4">
          <UFormField name="username" label="Username">
            <UInput v-model="state.username" class="w-full" />
          </UFormField>
          <UFormField name="email" label="Email">
            <UInput v-model="state.email" type="email" class="w-full" />
          </UFormField>
          <UFormField name="password" label="Password">
            <UInput v-model="state.password" type="password" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Numbers & Date Card -->
      <UCard class="w-full max-w-2xl mx-auto mb-4 p-6">
        <template #header>
          <div class="flex justify-between w-full">
            <h2 class="text-sm font-medium mb-3 opacity-80">Numbers & Date</h2>
          </div>
        </template>
        <div class="space-y-4">
          <UFormField name="age" label="Age">
            <UInput v-model.number="state.age" type="number" class="w-full" />
          </UFormField>
          <UFormField name="rating" label="Rating (0–5)">
            <UInput v-model.number="state.rating" type="number" step="0.1" class="w-full" />
          </UFormField>
          <UFormField name="birthdate" label="Birthdate">
            <UInput v-model="birthdateStr" type="date" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Enums Card -->
      <UCard class="w-full max-w-2xl mx-auto mb-4 p-6">
        <template #header>
          <div class="flex justify-between w-full">
            <h2 class="text-sm font-medium mb-3 opacity-80">Enums</h2>
          </div>
        </template>
        <div class="space-y-4">
          <UFormField name="role" label="Role">
            <USelect v-model="state.role" :options="roles" class="w-full" />
          </UFormField>
          <UFormField name="status" label="Status">
            <USelect v-model="state.status" :options="statuses" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Arrays Card -->
      <UCard class="w-full max-w-2xl mx-auto mb-4 p-6">
        <template #header>
          <div class="flex justify-between w-full">
            <h2 class="text-sm font-medium mb-3 opacity-80">Arrays</h2>
          </div>
        </template>
        <div class="space-y-4">
          <UFormField name="tags" label="Tags (comma separated)">
            <UInput v-model="tagsCsv" placeholder="nuxt, zod, fastify" class="w-full" />
          </UFormField>
          <UFormField name="scores" label="Scores (comma separated)">
            <UInput v-model="scoresCsv" placeholder="10, 20, 50" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Address Card -->
      <UCard class="w-full max-w-2xl mx-auto mb-4 p-6">
        <template #header>
          <div class="flex justify-between w-full">
            <h2 class="text-sm font-medium mb-3 opacity-80">Address</h2>
          </div>
        </template>
        <div class="space-y-4">
          <UFormField name="address.street" label="Street">
            <UInput v-model="state.address.street" class="w-full" />
          </UFormField>
          <UFormField name="address.city" label="City">
            <UInput v-model="state.address.city" class="w-full" />
          </UFormField>
          <UFormField name="address.zip" label="ZIP (5 digits)">
            <UInput v-model="state.address.zip" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Payment Card -->
      <UCard class="w-full max-w-2xl mx-auto mb-4 p-6">
        <template #header>
          <div class="flex justify-between w-full">
            <h2 class="text-sm font-medium mb-3 opacity-80">Payment</h2>
          </div>
        </template>
        <div class="space-y-4">
          <UFormField name="payment.type" label="Payment type">
            <USelect v-model="state.payment.type" :options="['card', 'paypal']" class="w-full" />
          </UFormField>
          <UFormField v-if="state.payment.type === 'card'" name="payment.cardNumber" label="Card number (16)">
            <UInput v-model="(state.payment as any).cardNumber" class="w-full" />
          </UFormField>
          <UFormField v-else name="payment.email" label="PayPal email">
            <UInput v-model="(state.payment as any).email" type="email" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Optional Card -->
      <UCard class="w-full max-w-2xl mx-auto mb-4 p-6">
        <template #header>
          <div class="flex justify-between w-full">
            <h2 class="text-sm font-medium mb-3 opacity-80">Optional</h2>
          </div>
        </template>
        <div>
          <UFormField name="bio" label="Bio">
            <UTextarea v-model="state.bio" :rows="3" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Security Card -->
      <UCard class="w-full max-w-2xl mx-auto mb-4 p-6">
        <template #header>
          <div class="flex justify-between w-full">
            <h2 class="text-sm font-medium mb-3 opacity-80">Security</h2>
          </div>
        </template>
        <div class="space-y-4">
          <UFormField name="security.password" label="New password">
            <UInput v-model="state.security.password" type="password" class="w-full" />
          </UFormField>
          <UFormField name="security.confirm" label="Confirm password">
            <UInput v-model="state.security.confirm" type="password" class="w-full" />
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
      <pre class="mt-2 text-xs opacity-80 overflow-auto w-full max-w-sm text-left"
        >{{ resultPretty }}
      </pre>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue';
import { ComplexSchema } from '@schema/complex';
const { t } = useI18n();

const schema = ComplexSchema;
const roles = ['user', 'admin', 'editor'];
const statuses = ['active', 'inactive'];

const state = reactive({
  username: '',
  email: '',
  password: '',
  website: '',
  age: 18,
  rating: 0,
  birthdate: new Date(),
  role: 'user' as 'user' | 'admin' | 'editor',
  status: 'active' as 'active' | 'inactive',
  tags: [] as string[],
  scores: [] as number[],
  address: { street: '', city: '', zip: '' },
  payment: { type: 'card', cardNumber: '' } as any,
  bio: null as string | null,
  security: { password: '', confirm: '' },
});

const tagsCsv = ref('');
const scoresCsv = ref('');

watch(tagsCsv, (v) => {
  state.tags = v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
});
watch(scoresCsv, (v) => {
  state.scores = v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n));
});

const birthdateStr = ref('');
watch(birthdateStr, (v) => {
  state.birthdate = v ? new Date(v) : new Date();
});

const result = ref<{ ok: boolean; errors: any[] } | null>(null);
const resultPretty = computed(() => (result.value ? JSON.stringify(result.value, null, 2) : ''));

function onSubmit() {
  const parsed = schema.safeParse({ ...state, birthdate: birthdateStr.value || state.birthdate });
  result.value = parsed.success ? { ok: true, errors: [] } : { ok: false, errors: parsed.error.issues };
}

function reset() {
  Object.assign(state, {
    username: '',
    email: '',
    password: '',
    website: '',
    age: 18,
    rating: 0,
    birthdate: new Date(),
    role: 'user',
    status: 'active',
    tags: [],
    scores: [],
    address: { street: '', city: '', zip: '' },
    payment: { type: 'card', cardNumber: '' },
    bio: null,
    security: { password: '', confirm: '' },
  });
  tagsCsv.value = '';
  scoresCsv.value = '';
  birthdateStr.value = '';
  result.value = null;
}

function fillDemo() {
  Object.assign(state, {
    username: 'mew_mew',
    email: 'cat@example.com',
    password: 'hunter42',
    website: 'https://nuxt.com',
    age: 28,
    rating: 4.5,
    role: 'admin',
    status: 'active',
    address: { street: 'Main 1', city: 'Bratislava', zip: '81101' },
    payment: { type: 'paypal', email: 'pay@example.com' },
    bio: 'I like Nuxt & Zod.',
    security: { password: 'hunter42', confirm: 'hunter42' },
  });
  tagsCsv.value = 'nuxt, zod, fastify, ts';
  scoresCsv.value = '10, 20, 50';
  birthdateStr.value = '1995-06-15';
  result.value = null;
}

definePageMeta({ layout: 'logged-in' });
</script>
