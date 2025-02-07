import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import "../styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <SpeedInsights />
      <Component {...pageProps} />
    </Layout>
  );
}
