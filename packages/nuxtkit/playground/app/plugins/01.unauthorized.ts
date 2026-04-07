import { Symbols } from '@di/symbols';

export default defineNuxtPlugin((nuxt) => {
  nuxt.hook('meawkit:unauthorized', async (context) => {
    const { error, redirect } = context;
    const localePath = useLocalePath();
    const localizedPath = localePath(Symbols.Routes.Login.path);

    useErrorNotifier(error);

    await redirect(localizedPath, { replace: true });
  });
});
