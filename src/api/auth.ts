import { client } from "./client";

import {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
} from "@/types/auth";

export async function registerUser(
  payload: RegisterPayload
) {
  const response = await client.post<RegisterResponse>(
    "/auth/register/",
    payload
  );

  return response.data;
}

export async function loginUser(
  payload: LoginPayload
) {
  const response = await client.post<LoginResponse>(
    "/auth/login/",
    payload
  );

  return response.data;
}


export async function logoutUser(
  refresh: string
) {
  const response =
    await client.post<LogoutResponse>(
      "/auth/logout/",
      {
        refresh,
      }
    );

  return response.data;
}