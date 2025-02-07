import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Backend için DSN
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === "development",
});
