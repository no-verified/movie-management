import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPaths = ["/auth/login", "/auth/register"];
  const isPublicPath = publicPaths.includes(pathname);
  
  // Vérifier la présence du token JWT
  const token = request.cookies.get("nestflix_token")?.value || 
                request.headers.get("authorization")?.replace("Bearer ", "");
  
  // Si l'utilisateur essaie d'accéder à une page publique alors qu'il est connecté,
  // le rediriger vers la page d'accueil
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page protégée,
  // le rediriger vers la page de connexion
  if (!isPublicPath && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};