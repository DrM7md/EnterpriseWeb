export interface AuthUser {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  unitId: number;
  roles: string[];
  permissions: string[];
}

export interface AuthResult {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}
