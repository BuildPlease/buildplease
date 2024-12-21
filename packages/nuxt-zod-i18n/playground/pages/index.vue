<script setup lang="ts">
import { type LoginDto, loginSchema } from '~/schema';
import type { FormSubmitEvent } from '#ui/types';

const { t } = useI18n();

const state = reactive<Partial<LoginDto>>({
	name: undefined,
	email: undefined
});

function onSubmit(event: FormSubmitEvent<LoginDto>) {
	console.log(event.data);
}
</script>

<template>
	<div class="mx-auto w-full max-w-4xl pb-24">
		<UAlert
			icon="i-heroicons-command-line"
			color="primary"
			variant="solid"
			:title="t('pages.index.alert.title')"
			:description="t('pages.index.alert.description')"
		/>

		<div class="mx-auto w-full max-w-lg">
			<UForm
				:schema="loginSchema"
				:state="state"
				class="flex flex-col gap-6 pt-6"
				@submit="onSubmit"
			>
				<h1 class="text-2xl font-bold">
					{{ t('pages.index.title') }}
				</h1>

				<USeparator />

				<UFormField
					:label="t('dictionary.name')"
					name="name"
				>
					<UInput
						v-model="state.name"
						placeholder="Your name"
						class="w-full"
					/>
				</UFormField>

				<UFormField
					:label="t('dictionary.email')"
					name="email"
				>
					<UInput
						v-model="state.email"
						placeholder="Your email"
						class="w-full"
					/>
				</UFormField>

				<!-- Submit button centered -->
				<UButton type="submit" class="w-full py-2 px-4 flex items-center justify-center gap-2">
					{{ t('dictionary.save') }}
				</UButton>
			</UForm>
		</div>
	</div>
</template>
