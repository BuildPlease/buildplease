import fpBasicAuth from './basic-auth';
import fpCookie from './cookie';
import fpCors from './cors';
import fpIp from './ip';
import fpLogger from './logger';
import fpMetadata from './metadata';
import fpMetrics from './metrics';
import fpMultipart from './multipart';
import fpScope from './scope';
import fpStaticFiles from './static';
import fpView from './view';

export const FastifyPlugins = {
  basicAuth: fpBasicAuth,
  cookie: fpCookie,
  cors: fpCors,
  ip: fpIp,
  logger: fpLogger,
  metadata: fpMetadata,
  metrics: fpMetrics,
  multipart: fpMultipart,
  scope: fpScope,
  staticFiles: fpStaticFiles,
  view: fpView,
} as const;
