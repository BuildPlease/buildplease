export default defineNuxtPlugin((nuxt) => {
  nuxt.hook('meowv:unauthorized', async (context) => {
    const { redirect } = context;
    await redirect('/');
  });
});
