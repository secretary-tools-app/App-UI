export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  token: string;
  expiresAt: string;
  alaId: number;
  role: string;
  displayName?: string;
  alaName?: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  inviteKey: string;
}

export interface UsuarioResponse {
  id: number;
  username: string;
  displayName?: string;
  role: string;
}

export interface UpdateProfileRequest {
  displayName: string;
}
