import { Symbols } from '@di/symbols';

export default defineNuxtPlugin((nuxt) => {
  nuxt.hook('meowv:unauthorized', async (context) => {
    const { redirect } = context;
    const localePath = useLocalePath();
    const localizedPath = localePath(Symbols.Routes.Login.path);

    await redirect(localizedPath, { replace: true });
  });
});
