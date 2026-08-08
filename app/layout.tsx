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
  title: "Mohamed Zayaan S | AI, Systems & Quant Engineering",
  description: "Pre-final year CS/CE undergrad at IIT Madras building verified, test-backed systems across deep learning, backend infrastructure, and quantitative finance — 12 projects, a published paper, and a Top-6 national hackathon finish.",
  metadataBase: new URL("https://zayaan-portfolio2026.vercel.app"),
  openGraph: {
    title: "Mohamed Zayaan S | AI, Systems & Quant Engineering",
    description: "Verified, test-backed systems across deep learning, backend infrastructure, and quantitative finance.",
    url: "https://zayaan-portfolio2026.vercel.app",
    siteName: "Mohamed Zayaan S",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohamed Zayaan S | AI, Systems & Quant Engineering",
    description: "Verified, test-backed systems across deep learning, backend infrastructure, and quantitative finance.",
  },
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