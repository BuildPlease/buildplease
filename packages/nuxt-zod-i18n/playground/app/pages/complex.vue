<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { CalendarDate, DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date';
import { type UserDto, userSchema } from '@schema';

const { t } = useI18n();

const df = new DateFormatter('en-US', {
	dateStyle: 'medium',
});

const state = reactive<Partial<UserDto>>({
	birthDate: new Date('2025-01-01T08:00:00.000Z'),
	email: 'test@test_com',
	firstName: 'test',
	lastName: 'test',
	preferredColor: 'blue',
});

const modelValue = shallowRef(new CalendarDate(2025, 1, 1));

function onBirthdateSelect(date: DateValue) {
	state.birthDate = date.toDate(getLocalTimeZone());
}

function onSubmit(event: FormSubmitEvent<UserDto>) {
	console.log(event.data);
}
</script>

<template>
	<div class="mx-auto w-full max-w-4xl pb-24">
		<!-- Alert Section -->
		<UAlert
			icon="i-heroicons-command-line"
			color="primary"
			variant="solid"
			:title="t('pages.complex.alert.title')"
			:description="t('pages.complex.alert.description')"
		/>

		<!-- Centered Form -->
		<div class="mx-auto w-full max-w-lg">
			<UForm
				:schema="userSchema"
				:state="state"
				class="flex flex-col gap-6 pt-6"
				@submit="onSubmit"
			>
				<!-- Title -->
				<h1 class="text-2xl font-bold">
					{{ t('pages.index.title') }}
				</h1>

				<USeparator />

				<!-- Birth Date -->
				<UFormField :label="t('dictionary.birthDate')" name="birthDate">
					<UPopover>
						<!-- Display selected date -->
						<UButton
							color="neutral"
							variant="subtle"
							icon="i-lucide-calendar"
							class="w-full"
						>
							{{ df.format(state.birthDate!) }}
						</UButton>

						<!-- Calendar with reactive update -->
						<template #content>
							<UCalendar
								v-model="modelValue"
								class="p-2"
								@update:model-value="onBirthdateSelect"
							/>
						</template>
					</UPopover>
				</UFormField>

				<!-- Email -->
				<UFormField :label="t('dictionary.email')" name="email">
					<UInput
						v-model="state.email"
						placeholder="Your email"
						class="w-full"
					/>
				</UFormField>

				<!-- First Name -->
				<UFormField :label="t('dictionary.firstName')" name="firstName">
					<UInput
						v-model="state.firstName"
						placeholder="Your first name"
						class="w-full"
					/>
				</UFormField>

				<!-- Last Name -->
				<UFormField :label="t('dictionary.lastName')" name="lastName">
					<UInput
						v-model="state.lastName"
						placeholder="Your last name"
						class="w-full"
					/>
				</UFormField>

				<!-- Preferred Color -->
				<UFormField :label="t('pages.complex.preferredColor')" name="preferredColor">
					<UInput
						v-model="state.preferredColor"
						placeholder="Your preferred color"
						class="w-full"
					/>
				</UFormField>

				<!-- Submit Button -->
				<UButton type="submit" class="w-full py-2 px-4 flex items-center justify-center gap-2">
					{{ t('dictionary.save') }}
				</UButton>
			</UForm>
		</div>
	</div>
</template>
