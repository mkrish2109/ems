import type { Metadata } from "next";
import { AuthProvider } from '@/contexts/AuthContext';
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import NavigationEvents from "@/components/providers/NavigationEvents";
import { NotificationProvider } from "@/contexts/NotificationContext";
import "./globals.css";
import AdScripts from "@/components/AdScripts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Expense Management System",
  description: "Expense Management System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EMS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
      </head>
     
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <AdScripts 
          clientId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-7311140109585146'}
          enableAnalytics={true}
        />
        <AuthProvider>
          <NotificationProvider>
            <NavigationEvents>
              {children}
            </NavigationEvents>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
