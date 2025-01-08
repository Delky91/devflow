import type { Metadata } from "next";
import { Geist, Geist_Mono as GeistMono } from "next/font/google";
import React from "react";
import "./globals.css";

const geistSans = Geist({
   variable: "--font-geist-sans",
   subsets: ["latin"],
});

const geistMono = GeistMono({
   variable: "--font-geist-mono",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "DevFlow",
   description: "My version of stack overflow",
   authors: [{ name: "Luis Miño Bustos" }],
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
         </body>
      </html>
   );
}
