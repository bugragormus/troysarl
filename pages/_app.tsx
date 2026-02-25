import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import "../styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Script from "next/script";
import { AuthProvider } from "../hooks/useAuth";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        {/* Google Analytics — tek bir yerde yükleniyor */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
        <SpeedInsights />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: { zIndex: 999999 },
          }}
          containerStyle={{ zIndex: 999999 }}
        />
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
