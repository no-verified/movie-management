import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../components/ReactQueryProvider";
import Link from "next/link";
import Image from "next/image";
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
        {/* Header global */}
        <header className="border-b-3 border-border bg-card p-4 sm:p-6 shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="container mx-auto">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
            >
              <Image
                src="/file.svg"
                alt="Nestflix logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider text-foreground">
                Nestflix
              </span>
            </Link>
            <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground font-medium">
              Discover amazing movies and talented actors
            </p>
          </div>
        </header>
        <ReactQueryProvider>
          {children}
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </ReactQueryProvider>
        {/* Footer global */}
        <footer className="border-t-3 border-border bg-card p-4 text-center text-sm text-muted-foreground shadow-[0_-4px_0px_0px_rgba(0,0,0,1)] mt-8">
          © 2025 Nestflix - Built by{" "}
          <a
            href="https://github.com/no-verified/movie-management"
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            TMN
          </a>
        </footer>
      </body>
    </html>
  );
}
