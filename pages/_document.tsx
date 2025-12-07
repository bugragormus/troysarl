import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="icon" href="/fav_icon.ico" sizes="any" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          {/* PWA Meta Tags */}
          <meta name="theme-color" content="#2563eb" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-title" content="Troy Cars" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#2563eb" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
        </Head>
        <body className="antialiased dark:bg-gray-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
