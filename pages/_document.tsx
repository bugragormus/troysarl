import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/fav_icon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/fav_icon.ico" />
        </Head>
        <body className="antialiased dark:bg-gray-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
