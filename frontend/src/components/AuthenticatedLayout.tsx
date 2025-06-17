"use client";

import {usePathname} from "next/navigation";
import {useAuth} from "../contexts/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import {Button} from "./ui/button";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const {user, logout, isAuthenticated} = useAuth();

  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPaths = ["/auth/login", "/auth/register"];
  const isPublicPath = publicPaths.includes(pathname);

  // Si c'est une page publique, afficher directement sans protection
  if (isPublicPath) {
    return (
      <>
        {/* Header simplifié pour les pages d'auth */}
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
        {children}
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
      </>
    );
  }

  // Pour les pages protégées, utiliser ProtectedRoute
  return (
    <ProtectedRoute>
      {/* Header avec info utilisateur */}
      <header className="border-b-3 border-border bg-card p-4 sm:p-6 shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
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

            {/* Section utilisateur */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={logout}
                  className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>

          <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground font-medium">
            Discover amazing movies and talented actors
          </p>
        </div>
      </header>

      {children}

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
    </ProtectedRoute>
  );
}
