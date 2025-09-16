<template>
  <UContainer class="flex flex-1 items-center justify-center py-8">
    <div class="mb-6 flex w-full max-w-2xl flex-col items-center">
      <div class="mb-6 flex w-full items-center justify-between">
        <div class="flex w-full flex-col items-start">
          <h1 class="text-xl font-semibold">Complex Validation</h1>
          <p class="w-full text-left text-sm opacity-70">
            Strings, numbers, dates, enums, arrays, objects, unions, refine
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            size="xs"
            variant="soft"
            class="h-10 w-auto whitespace-nowrap"
            @click="fillInvalid"
          >
            Fill Invalid
          </UButton>
          <UButton
            size="xs"
            variant="soft"
            class="h-10 w-auto whitespace-nowrap"
            @click="fillValid"
          >
            Fill Valid
          </UButton>
          <UButton
            size="xs"
            variant="soft"
            class="h-10 w-auto whitespace-nowrap"
            @click="resetForm"
          >
            Reset
          </UButton>
        </div>
      </div>
    </div>

    <UForm
      :schema="schema"
      :state="state as ComplexData"
      class="mt-8 flex w-full flex-col items-center space-y-8"
      @submit="onSubmit"
      @error="onError"
    >
      <!-- String Fields Section -->
      <UCard class="mx-auto mb-4 w-full max-w-2xl p-6">
        <template #header>
          <h2 class="mb-3 text-sm font-medium opacity-80">String Fields</h2>
        </template>
        <div class="space-y-4">
          <UFormField
            name="stringFields.stringMin1"
            label="String Min 1 (min 1 char)"
          >
            <UInput
              v-model="state.stringFields.stringMin1"
              class="w-full"
              placeholder="At least 1 character"
            />
          </UFormField>
          <UFormField
            name="stringFields.stringMin2"
            label="String Min 2 (min 2 chars)"
          >
            <UInput
              v-model="state.stringFields.stringMin2"
              class="w-full"
              placeholder="At least 2 characters"
            />
          </UFormField>
          <UFormField
            name="stringFields.stringMin5"
            label="String Min 5 (min 5 chars)"
          >
            <UInput
              v-model="state.stringFields.stringMin5"
              class="w-full"
              placeholder="At least 5 characters"
            />
          </UFormField>

          <UFormField
            name="stringFields.stringMax1"
            label="String Max 1 (max 1 char)"
          >
            <UInput
              v-model="state.stringFields.stringMax1"
              class="w-full"
              placeholder="At most 1 character"
            />
          </UFormField>

          <UFormField
            name="stringFields.stringMax2"
            label="String Max 2 (max 2 chars)"
          >
            <UInput
              v-model="state.stringFields.stringMax2"
              class="w-full"
              placeholder="At most 2 characters"
            />
          </UFormField>

          <UFormField
            name="stringFields.stringMax5"
            label="String Max 5 (max 5 chars)"
          >
            <UInput
              v-model="state.stringFields.stringMax5"
              class="w-full"
              placeholder="At most 5 characters"
            />
          </UFormField>

          <UFormField
            name="stringFields.regexLowercased"
            label="Lowercase Format"
          >
            <UInput
              v-model="state.stringFields.regexLowercased"
              class="w-full"
              placeholder="Lowercase letters only"
            />
          </UFormField>
          <UFormField
            name="stringFields.regexUppercased"
            label="Uppercase Format"
          >
            <UInput
              v-model="state.stringFields.regexUppercased"
              class="w-full"
              placeholder="Uppercase letters only"
            />
          </UFormField>
          <UFormField
            name="stringFields.email"
            label="Email Format"
          >
            <UInput
              v-model="state.stringFields.email"
              type="email"
              class="w-full"
              placeholder="Valid email"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Date Fields Section -->
      <UCard class="mx-auto mb-4 w-full max-w-2xl p-6">
        <template #header>
          <h2 class="mb-3 text-sm font-medium opacity-80">Date Fields</h2>
        </template>
        <div class="space-y-4">
          <!-- Simple Date -->
          <UFormField
            name="dates.date"
            label="Date"
          >
            <UPopover>
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-lucide-calendar"
              >
                {{ dateModel ? dateFormatter.format(dateModel.toDate(getLocalTimeZone())) : 'Select a date' }}
              </UButton>

              <template #content>
                <UCalendar
                  v-model="dateModel"
                  class="p-2"
                />
              </template>
            </UPopover>
          </UFormField>

          <!-- Date with Min -->
          <UFormField
            name="dates.dateMin"
            label="Date With Min (After 2000-01-01)"
          >
            <UPopover>
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-lucide-calendar"
              >
                {{
                  dateMinModel
                    ? dateFormatter.format(dateMinModel.toDate(getLocalTimeZone()))
                    : 'Select a date'
                }}
              </UButton>

              <template #content>
                <UCalendar
                  v-model="dateMinModel"
                  class="p-2"
                />
              </template>
            </UPopover>
          </UFormField>

          <!-- Date with Max -->
          <UFormField
            name="dates.dateMax"
            label="Date With Max (Before 2030-01-01)"
          >
            <UPopover>
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-lucide-calendar"
              >
                {{
                  dateMaxModel
                    ? dateFormatter.format(dateMaxModel.toDate(getLocalTimeZone()))
                    : 'Select a date'
                }}
              </UButton>

              <template #content>
                <UCalendar
                  v-model="dateMaxModel"
                  class="p-2"
                />
              </template>
            </UPopover>
          </UFormField>

          <!-- Date Range -->
          <UFormField
            name="dates.dateRange"
            label="Date Range"
            :error-pattern="/^dates.dateRange\.(start|end)$/"
          >
            <UCalendar
              range
              v-model="dateRangeModel"
              class="p-2"
              selectionMode="range"
            />
          </UFormField>

          <!-- ISO Date -->
          <UFormField
            name="dates.dateISO"
            label="ISO Date"
          >
            <UInput
              v-model="state.dates.dateISO"
              class="w-full"
              placeholder="Valid ISO date (YYYY-MM-DD)"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Submit Button -->
      <div class="mt-6 flex justify-center gap-3">
        <UButton
          label="Validate"
          type="submit"
          color="primary"
        />
      </div>
    </UForm>

    <!-- Validation Result -->
    <div
      v-if="result"
      class="mt-6 flex w-full flex-col items-center"
    >
      <UAlert
        v-if="result.ok"
        color="success"
        variant="subtle"
        title="Valid!"
        class="w-full max-w-sm"
      />
      <UAlert
        v-else
        color="error"
        variant="soft"
        :title="`Errors (${result.errors.length})`"
        class="w-full max-w-sm"
      />
      <pre class="mt-2 w-full max-w-sm overflow-auto text-left text-xs opacity-80">{{ resultPretty }}</pre>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import type { FormSubmitEvent, FormErrorEvent } from '@nuxt/ui';
import { type ComplexData, type ComplexDto, complexSchema } from '@schema/complex';
import { type CalendarDate, DateFormatter, parseDate, getLocalTimeZone } from '@internationalized/date';
import type { DateRange } from 'reka-ui';

const schema = complexSchema;
const result = ref<{ ok: boolean; errors: any[] } | null>(null);
const resultPretty = computed(() => (result.value ? JSON.stringify(result.value, null, 2) : ''));

const dateFormatter = new DateFormatter('en-US', { dateStyle: 'medium' });
const timezone = getLocalTimeZone();

const dateModel = computed<CalendarDate | undefined>({
  get: () => {
    if (state.dates.date && !isNaN(state.dates.date.getTime())) {
      return parseDate(state.dates.date.toISOString().slice(0, 10));
    }
    return undefined;
  },
  set: (d) => {
    state.dates.date = d?.toDate(timezone) ?? undefined;
  },
});

const dateMinModel = computed<CalendarDate | undefined>({
  get: () => {
    if (state.dates.dateMin && !isNaN(state.dates.dateMin.getTime())) {
      return parseDate(state.dates.dateMin.toISOString().slice(0, 10));
    }
    return undefined;
  },
  set: (d) => {
    state.dates.dateMin = d?.toDate(timezone) ?? undefined;
  },
});

const dateMaxModel = computed<CalendarDate | undefined>({
  get: () => {
    if (state.dates.dateMax && !isNaN(state.dates.dateMax.getTime())) {
      return parseDate(state.dates.dateMax.toISOString().slice(0, 10));
    }
    return undefined;
  },
  set: (d) => {
    state.dates.dateMax = d?.toDate(timezone) ?? undefined;
  },
});

const dateRangeModel = computed<DateRange>({
  get() {
    const { start, end } = state.dates.dateRange;
    return {
      start: start ? parseDate(start.toISOString().slice(0, 10)) : undefined,
      end: end ? parseDate(end.toISOString().slice(0, 10)) : undefined,
    };
  },
  set(value) {
    state.dates.dateRange.start = value.start ? new Date(value.start.toString()) : undefined;
    state.dates.dateRange.end = value.end ? new Date(value.end.toString()) : undefined;
  },
});

const initialState: ComplexDto = {
  stringFields: {
    stringMin1: undefined,
    stringMin2: undefined,
    stringMin5: undefined,
    stringMax1: undefined,
    stringMax2: undefined,
    stringMax5: undefined,
    regexLowercased: undefined,
    regexUppercased: undefined,
    email: undefined,
    url: undefined,
  },
  dates: {
    date: undefined,
    dateMin: undefined,
    dateMax: undefined,
    dateRange: {
      start: undefined,
      end: undefined,
    },
    dateISO: undefined,
  },
};

const state = reactive<ComplexDto>({ ...initialState });

function fillInvalid() {
  const invalidState: ComplexDto = {
    stringFields: {
      stringMin1: '',
      stringMin2: 'A',
      stringMin5: 'AB',
      stringMax1: 'AB',
      stringMax2: 'ABC',
      stringMax5: 'ABCDEFG',
      regexLowercased: 'ABC',
      regexUppercased: 'abc',
      email: 'not-an-email',
      url: 'not-a-url',
    },
    dates: {
      date: undefined,
      dateMin: new Date('1999-13-01'),
      dateMax: new Date('3000-13-01'),
      dateRange: {
        start: undefined,
        end: undefined,
      },
      dateISO: 'invalid-date',
    },
  };
  Object.assign(state, invalidState);
}

function fillValid() {
  const validState: ComplexDto = {
    stringFields: {
      stringMin1: 'A',
      stringMin2: 'AB',
      stringMin5: 'ABCDE',
      stringMax1: 'A',
      stringMax2: 'AB',
      stringMax5: 'ABCDE',
      regexLowercased: 'abc',
      regexUppercased: 'ABC',
      email: 'test@example.com',
      url: 'https://example.com',
    },
    dates: {
      date: new Date('2024-01-01'),
      dateMin: new Date('2025-01-01'),
      dateMax: new Date('2020-01-01'),
      dateRange: {
        start: new Date(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      dateISO: '2024-01-01',
    },
  };
  Object.assign(state, validState);
}

function resetForm() {
  Object.assign(state, initialState);
  result.value = null;
}

async function onSubmit(event: FormSubmitEvent<ComplexData>) {
  result.value = null;
  console.log('parsing even data: ', event.data);
  const parsed = await complexSchema.safeParseAsync(event.data);
  console.log('data: ', parsed);
  result.value = parsed.success ? { ok: true, errors: [] } : { ok: false, errors: parsed.error.issues };
}

async function onError(event: FormErrorEvent) {
  console.log('error: ', event.errors);
  if (event?.errors?.[0]?.id) {
    const element = document.getElementById(event.errors[0].id);
    element?.focus();
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

definePageMeta({ layout: 'logged-in' });
</script>
