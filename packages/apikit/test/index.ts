import { makeApikitContext } from '@nidavellirx/meowv-apikit';

async function bootstrap() {
  try {
    await makeApikitContext({ environment: 'development' });
  } catch (error) {
    console.error('Application failed to start:', error);
    process.exit(1);
  }
}

bootstrap();
