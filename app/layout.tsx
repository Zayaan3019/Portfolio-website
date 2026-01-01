import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css"; // <--- THIS LINE IS CRITICAL. IF MISSING, UI BREAKS.

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter", 
  display: "swap" 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains", 
  display: "swap" 
});

export const metadata: Metadata = {
  title: "Mohamed Zayaan S | Portfolio",
  description: "AI Researcher & Systems Engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-[#020617] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}