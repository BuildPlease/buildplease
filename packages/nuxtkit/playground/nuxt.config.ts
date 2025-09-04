export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/i18n'],
  meowvNuxtKit: {
    unauthorizedStatusCodes: [401, 403],
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-12-25',
});
