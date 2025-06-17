const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
}

class AuthService {
  private readonly TOKEN_KEY = "nestflix_token";
  private readonly USER_KEY = "nestflix_user";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<User> {
    const authResponse = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    this.setToken(authResponse.access_token);
    // Stocker aussi le token dans un cookie pour le middleware Next.js
    if (typeof document !== "undefined") {
      document.cookie = `nestflix_token=${authResponse.access_token}; path=/;`;
    }
    // Décoder le JWT pour obtenir les infos utilisateur
    const user = this.getUserFromToken(authResponse.access_token);
    this.setUser(user);
    return user;
  }

  async register(userData: RegisterRequest): Promise<User> {
    const authResponse = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    this.setToken(authResponse.access_token);
    // Stocker aussi le token dans un cookie pour le middleware Next.js
    if (typeof document !== "undefined") {
      document.cookie = `nestflix_token=${authResponse.access_token}; path=/;`;
    }
    // Pour register, on peut construire l'utilisateur à partir des données envoyées
    const user: User = {
      id: "", // Sera extrait du token
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
    };
    // Décoder le JWT pour obtenir l'ID réel
    const tokenUser = this.getUserFromToken(authResponse.access_token);
    user.id = tokenUser.id;
    this.setUser(user);
    return user;
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      // Supprimer aussi le cookie côté client
      document.cookie =
        "nestflix_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  private getUserFromToken(token: string): User {
    try {
      const payload = this.decodeToken(token);
      return {
        id: payload.sub,
        email: payload.email,
        firstName: "", // Ces champs ne sont pas dans le JWT, on les récupèrera autrement
        lastName: "",
      };
    } catch {
      throw new Error("Invalid token");
    }
  }

  private decodeToken(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }

  getAuthHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }
}

export const authService = new AuthService();
