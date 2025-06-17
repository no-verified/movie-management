import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../components/ReactQueryProvider";
import { AuthProvider } from "../contexts/AuthContext";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
// import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nestflix",
  description: "Nestflix - find your favorite movies and actors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{backgroundColor: "#f7fafc"}}
      >
        <AuthProvider>
          <ReactQueryProvider>
            <AuthenticatedLayout>
              {children}
            </AuthenticatedLayout>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
