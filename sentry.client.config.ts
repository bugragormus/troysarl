import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, // DSN'yi env'den al
  tracesSampleRate: 1.0, // Performans takibi (0.0 - 1.0 arası değer alır)
  debug: process.env.NODE_ENV === "development", // Sadece geliştirme modunda hata ayıklama açılır
});
