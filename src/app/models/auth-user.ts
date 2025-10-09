export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  enabled: boolean;
  accountNonLocked: boolean;
  userId: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}