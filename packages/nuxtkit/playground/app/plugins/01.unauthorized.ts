import { Symbols } from '@di/symbols';

export default defineNuxtPlugin((nuxt) => {
  const localePath = useLocalePath();
  const notifyError = useErrorNotifier();

  nuxt.hook('meawkit:unauthorized', async (context) => {
    const { error, redirect } = context;
    const localizedPath = localePath(Symbols.Routes.Login.path);

    notifyError(error);
    await redirect(localizedPath, { replace: true });
  });
});
