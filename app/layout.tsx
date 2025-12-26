import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import TitleManager from "@/components/TitleManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"], // multiple weights
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BeforeListed",
    template: "%s | BeforeListed",
  },
  description: "Early access to pre-market rental listings.",
  icons: {
    icon: "/Logomark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Providers>
          <TitleManager />
          {children}
        </Providers>
      </body>
    </html>
  );
}
