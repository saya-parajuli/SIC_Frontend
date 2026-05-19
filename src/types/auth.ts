export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterResponse {
  message?: string;
  detail?: string;
}

export type ValidationErrors<T> = Partial<
  Record<keyof T, string>
>;

export interface LogoutResponse {
  detail?: string;
  message?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message?: string;
  detail?: string;
}

export interface ResetPasswordPayload {
  reset_token: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  message?: string;
  detail?: string;
}

export interface ResetPasswordErrors {
  otp?: string;
  new_password?: string;
  confirm_password?: string;
}