import { User } from '../types/User';

interface LoginResponse {
  user: User;
  token: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private token: string | null = null;

  private constructor() {
    // Initialize from localStorage if available
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('current_user');
    
    if (storedToken && storedUser) {
      this.token = storedToken;
      this.currentUser = JSON.parse(storedUser);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      this.setSession(data.user, data.token);
      return data.user;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });
      }
    } finally {
      this.clearSession();
    }
  }

  public async refreshToken(): Promise<void> {
    if (!this.token) return;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data: LoginResponse = await response.json();
      this.setSession(data.user, data.token);
    } catch (error) {
      this.clearSession();
      throw new Error('Session expired');
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  public hasPermission(permission: string): boolean {
    return this.currentUser?.permissions.includes(permission) || false;
  }

  public hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  private setSession(user: User, token: string): void {
    this.currentUser = user;
    this.token = token;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private clearSession(): void {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }
} 