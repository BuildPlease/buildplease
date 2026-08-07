<template>
  <UContainer class="flex flex-1 items-center justify-center py-8">
    <div class="mb-6 flex w-full max-w-2xl flex-col items-center">
      <div class="mb-6 flex w-full items-center justify-between">
        <div class="flex w-full flex-col items-start">
          <h1 class="text-xl font-semibold">{{ t('page.complexValidation.title') }}</h1>
          <p class="w-full text-left text-sm opacity-70">
            {{ t('page.complexValidation.description') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            size="xs"
            variant="soft"
            class="h-10 w-auto whitespace-nowrap"
            @click="fillInvalid"
          >
            {{ t('page.complexValidation.actions.fillInvalid') }}
          </UButton>
          <UButton
            size="xs"
            variant="soft"
            class="h-10 w-auto whitespace-nowrap"
            @click="fillValid"
          >
            {{ t('page.complexValidation.actions.fillValid') }}
          </UButton>
          <UButton
            size="xs"
            variant="soft"
            class="h-10 w-auto whitespace-nowrap"
            @click="resetForm"
          >
            {{ t('page.complexValidation.actions.reset') }}
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
          <h2 class="mb-3 text-sm font-medium opacity-80">{{ t('page.complexValidation.sections.stringFields') }}</h2>
        </template>
        <div class="space-y-4">
          <UFormField
            name="stringFields.stringMin1"
            :label="t('page.complexValidation.fields.stringMin1.label')"
          >
            <UInput
              v-model="state.stringFields.stringMin1"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.stringMin1.placeholder')"
            />
          </UFormField>
          <UFormField
            name="stringFields.stringMin2"
            :label="t('page.complexValidation.fields.stringMin2.label')"
          >
            <UInput
              v-model="state.stringFields.stringMin2"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.stringMin2.placeholder')"
            />
          </UFormField>
          <UFormField
            name="stringFields.stringMin5"
            :label="t('page.complexValidation.fields.stringMin5.label')"
          >
            <UInput
              v-model="state.stringFields.stringMin5"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.stringMin5.placeholder')"
            />
          </UFormField>

          <UFormField
            name="stringFields.stringMax1"
            :label="t('page.complexValidation.fields.stringMax1.label')"
          >
            <UInput
              v-model="state.stringFields.stringMax1"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.stringMax1.placeholder')"
            />
          </UFormField>

          <UFormField
            name="stringFields.stringMax2"
            :label="t('page.complexValidation.fields.stringMax2.label')"
          >
            <UInput
              v-model="state.stringFields.stringMax2"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.stringMax2.placeholder')"
            />
          </UFormField>

          <UFormField
            name="stringFields.stringMax5"
            :label="t('page.complexValidation.fields.stringMax5.label')"
          >
            <UInput
              v-model="state.stringFields.stringMax5"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.stringMax5.placeholder')"
            />
          </UFormField>

          <UFormField
            name="stringFields.regexLowercased"
            :label="t('page.complexValidation.fields.regexLowercased.label')"
          >
            <UInput
              v-model="state.stringFields.regexLowercased"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.regexLowercased.placeholder')"
            />
          </UFormField>
          <UFormField
            name="stringFields.regexUppercased"
            :label="t('page.complexValidation.fields.regexUppercased.label')"
          >
            <UInput
              v-model="state.stringFields.regexUppercased"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.regexUppercased.placeholder')"
            />
          </UFormField>
          <UFormField
            name="stringFields.email"
            :label="t('page.complexValidation.fields.email.label')"
          >
            <UInput
              v-model="state.stringFields.email"
              type="email"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.email.placeholder')"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Date Fields Section -->
      <UCard class="mx-auto mb-4 w-full max-w-2xl p-6">
        <template #header>
          <h2 class="mb-3 text-sm font-medium opacity-80">{{ t('page.complexValidation.sections.dateFields') }}</h2>
        </template>
        <div class="space-y-4">
          <!-- Simple Date -->
          <UFormField
            name="dates.date"
            :label="t('page.complexValidation.fields.date.label')"
          >
            <UPopover>
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-lucide-calendar"
              >
                {{
                  dateModel
                    ? dateFormatter.format(dateModel.toDate(getLocalTimeZone()))
                    : t('page.complexValidation.fields.date.placeholder')
                }}
              </UButton>

              <template #content>
                <UCalendar
                  v-model="dateModel"
                  :locale="locale"
                  class="p-2"
                />
              </template>
            </UPopover>
          </UFormField>

          <!-- Date with Min -->
          <UFormField
            name="dates.dateMin"
            :label="t('page.complexValidation.fields.dateMin.label')"
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
                    : t('page.complexValidation.fields.dateMin.placeholder')
                }}
              </UButton>

              <template #content>
                <UCalendar
                  v-model="dateMinModel"
                  :locale="locale"
                  class="p-2"
                />
              </template>
            </UPopover>
          </UFormField>

          <!-- Date with Max -->
          <UFormField
            name="dates.dateMax"
            :label="t('page.complexValidation.fields.dateMax.label')"
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
                    : t('page.complexValidation.fields.dateMax.placeholder')
                }}
              </UButton>

              <template #content>
                <UCalendar
                  v-model="dateMaxModel"
                  :locale="locale"
                  class="p-2"
                />
              </template>
            </UPopover>
          </UFormField>

          <!-- Date Range -->
          <UFormField
            name="dates.dateRange"
            :label="t('page.complexValidation.fields.dateRange.label')"
            :error-pattern="/^dates.dateRange\.(start|end)$/"
          >
            <UCalendar
              v-model="dateRangeModel"
              range
              :locale="locale"
              class="p-2"
              selectionMode="range"
            />
          </UFormField>

          <!-- ISO Date -->
          <UFormField
            name="dates.dateISO"
            :label="t('page.complexValidation.fields.dateISO.label')"
          >
            <UInput
              v-model="state.dates.dateISO"
              class="w-full"
              :placeholder="t('page.complexValidation.fields.dateISO.placeholder')"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Submit Button -->
      <div class="mt-6 flex justify-center gap-3">
        <UButton
          :label="t('page.complexValidation.actions.validate')"
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
        :title="t('page.complexValidation.result.valid')"
        class="w-full max-w-sm"
      />
      <UAlert
        v-else
        color="error"
        variant="soft"
        :title="t('page.complexValidation.result.errors', { count: result.errors.length })"
        class="w-full max-w-sm"
      />
      <pre class="mt-2 w-full max-w-sm overflow-auto text-left text-xs opacity-80">{{ resultPretty }}</pre>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { type CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date';
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui';
import { type ComplexData, type ComplexDto, complexSchema } from '@schema/complex';
import type { DateRange } from 'reka-ui';
import { computed, reactive, ref } from 'vue';

const schema = complexSchema;
const { locale, t } = useI18n();
const result = ref<{ ok: boolean; errors: any[] } | null>(null);
const resultPretty = computed(() => (result.value ? JSON.stringify(result.value, null, 2) : ''));

const dateFormatter = computed(() => new DateFormatter(locale.value, { dateStyle: 'medium' }));
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
  const parsed = await complexSchema.safeParseAsync(event.data);
  result.value = parsed.success ? { ok: true, errors: [] } : { ok: false, errors: parsed.error.issues };
}

async function onError(event: FormErrorEvent) {
  if (event?.errors?.[0]?.id) {
    const element = document.getElementById(event.errors[0].id);
    element?.focus();
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

definePageMeta({ layout: 'logged-in' });
</script>
