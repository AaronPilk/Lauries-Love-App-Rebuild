import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: 'https://ecdd14e36ba8a5daac7d2ce7aae26a9d@o4506389729181696.ingest.us.sentry.io/4508223561793536',
  environment: process.env.ENVIRONMENT || 'development',
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1,
  profilesSampleRate: 1,
});
