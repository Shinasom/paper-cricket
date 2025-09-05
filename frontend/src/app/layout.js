// src/app/layout.js

import { Inter } from "next/font/google";
import "./globals.css";

// 1. Import our provider
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Paper Cricket",
  description: "The classic notebook game, now online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Wrap the children with the provider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}