import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";

const inter = Libre_Baskerville({
  variable: "--font-geist-sans",
  subsets: ["latin"],
    weight: ["400", "700"],
});



export const metadata: Metadata = {
  title: "Alert Hospital",
  description: "Blog page for Alert Hospital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
