import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import { Analytics } from "@vercel/analytics/next";
import { Nunito, Montserrat } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ConditionalLayout from "./components/ConditionalLayout";
import ClientMotionProvider from "./components/ClientMotionProvider";
import Script from "next/script";
import WhatsAppButton from "./components/FloatingWhatsappButton";

//  font configurations
const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
  weight: ["400", "500", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Andishi",
  description: "Democratizing Tech Talent for Everyone",
  other: {
    "font-subset": "latin",
    "font-display": "swap",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${montserrat.variable}`}>
      <body className="relative font-sans antialiased text-white bg-dark">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover opacity-75" />

        <AuthProvider>
          <ClientMotionProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Analytics />
            <SpeedInsights />
          </ClientMotionProvider>
        </AuthProvider>

        {/* Floating WhatsApp Button */}
        <WhatsAppButton />

        {/* Google Analytics Scripts */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8668KBDWFZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8668KBDWFZ');
          `}
        </Script>

        {/* Google Ads Conversion Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16686798799"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16686798799');
          `}
        </Script>
      </body>
    </html>
  );
}
