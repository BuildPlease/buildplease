<script setup lang="ts">
import type { WebsiteDto } from '~/schema';
import type { FormSubmitEvent } from '#ui/types';
import { websiteSchema } from '~/schema';

const { t } = useI18n();

const state = reactive({
	name: 'My website',
	url: 'Not an url',
});

function onSubmit(event: FormSubmitEvent<WebsiteDto>) {
	console.log(event.data);
}
</script>

<template>
	<div class="mx-auto w-full max-w-4xl pb-24">
		<UAlert
			icon="i-heroicons-command-line"
			color="primary"
			variant="solid"
			:title="t('pages.overload.alert.title')"
			:description="t('pages.overload.alert.description')"
		/>

		<!-- Centered Form -->
		<div class="mx-auto w-full max-w-lg">
			<UForm
				:schema="websiteSchema"
				:state="state"
				class="flex flex-col gap-6 pt-6"
				@submit="onSubmit"
			>
				<!-- Title -->
				<h1 class="text-2xl font-bold">
					{{ t('pages.overload.title') }}
				</h1>

				<USeparator />

				<!-- Name Field -->
				<UFormField
					:label="t('dictionary.name')"
					name="name"
				>
					<UInput
						v-model="state.name"
						placeholder="Website name"
						class="w-full"
					/>
				</UFormField>

				<!-- URL Field -->
				<UFormField
					:label="t('dictionary.url')"
					name="url"
				>
					<UInput
						v-model="state.url"
						placeholder="Website url"
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
