import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartCart - Problem-Based Smart Shopping",
  description: "Tell us your problem, we'll build the perfect product bundle for you. AI-powered smart shopping experience.",
  keywords: "smart shopping, product bundles, AI recommendations, ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen pt-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
