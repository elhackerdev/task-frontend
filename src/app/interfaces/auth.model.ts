export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: string; // ejemplo: "USER" o "ADMIN"
}

export interface AuthResponse {
  token: string;
}