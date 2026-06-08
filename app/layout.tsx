import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import TitleManager from "@/components/TitleManager";
import ViewportManager from "@/components/ViewportManager";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"], // multiple weights for flexibility
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BeforeListed",
    template: "%s | BeforeListed",
  },
  description: "Early access to pre-market rental listings.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-image-preview": "none",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
          <ViewportManager />
          {children}
        </Providers>
      </body>
    </html>
  );
}
