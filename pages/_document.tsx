import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <link rel="icon" href="/fav_icon.ico" sizes="any" />
      <body className="antialiased dark:bg-gray-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
