<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n';
import type { DropdownMenuItem } from '#ui/types';

const props = withDefaults(
	defineProps<{
		displayFlag?: boolean;
		labelField?: 'code' | 'name';
	}>(),
	{
		displayFlag: true,
		labelField: 'name',
	},
);

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => locales.value.filter(l => l.code !== locale.value));
const currentLocale = computed(() => locales.value.find(l => l.code === locale.value));
const currentFlag = computed(() => currentLocale.value ? makeFlag(currentLocale.value) : undefined);
const currentLabel = computed(() =>
	props.labelField === 'name'
		? currentLocale.value?.name ?? currentLocale.value?.code
		: currentLocale.value?.code,
);

const items = computed<DropdownMenuItem[][]>(() => [
	availableLocales.value.map(l => ({
		label: props.labelField === 'name' ? l.name ?? l.code : l.code,
		to: switchLocalePath(l.code),
		icon: makeFlag(l),
	})),
]);

function makeFlag(localeObj: LocaleObject): string | undefined {
	if (!props.displayFlag) return undefined;

	// MARK: - Priority 1: Use explicitly defined flag
	if (localeObj.flag) {
		return `i-flag-${localeObj.flag.toLowerCase()}-4x3`;
	}

	// MARK: - Priority 2: Extract from code (safe handling for region or base code)
	const code = localeObj.code;
	const parts = code.split('-');
	const baseCode = parts[0]?.toLowerCase();
	const regionCode = parts[1]?.toLowerCase();

	return regionCode ? `i-flag-${regionCode}-4x3` : `i-flag-${baseCode}-4x3`;
}
</script>

<template>
	<div>
		<UDropdownMenu :items="items">
			<!-- Current locale button -->
			<UButton variant="outline" color="neutral" trailing-icon="i-heroicons-chevron-down-20-solid">
				<UIcon v-if="currentFlag" :name="currentFlag" dynamic />
				{{ currentLabel }}
			</UButton>

			<!-- Dropdown items -->
			<template #item="{ item }">
				<UIcon v-if="item.icon" :name="item.icon" dynamic />
				<span class="truncate">{{ item.label }}</span>
			</template>
		</UDropdownMenu>
	</div>
</template>
