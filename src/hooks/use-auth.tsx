import { useState } from "react";
import { AxiosError } from "axios";
import { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, } from "@/api/auth";
import { storage } from "@/lib/storage";
import {
  RegisterPayload,
  LoginPayload,
  ValidationErrors,
  ResetPasswordPayload
} from "@/types/auth";


/* -------------------------------------------------------------------------- */
/*                                   REGISTER                                 */
/* -------------------------------------------------------------------------- */

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors<RegisterPayload>>({});


  const validate = (data: RegisterPayload) => {
    const newErrors: ValidationErrors<RegisterPayload> = {};

    // First Name
    if (!data.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    // Last Name
    if (!data.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    // Email
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    // Password
    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm Password
    if (!data.password2) {
      newErrors.password2 = "Confirm your password";
    } else if (data.password !== data.password2) {
      newErrors.password2 = "Passwords do not match";
    }

    // Phone (optional)
    if (data.phone && !/^[0-9+\-\s()]+$/.test(data.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const register = async (payload: RegisterPayload) => {
    const isValid = validate(payload);

    if (!isValid) return false;

    try {
      setLoading(true);

      await registerUser(payload);

      return true;
    } catch (error) {
      const err = error as AxiosError<any>;

      if (err.response?.data) {
        const backendErrors = err.response.data;

        setErrors((prev) => ({
          ...prev,
          email: backendErrors.email?.[0],
          password: backendErrors.password?.[0],
        }));
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    errors,
  };
}


/* -------------------------------------------------------------------------- */
/*                                     LOGIN                                  */
/* -------------------------------------------------------------------------- */

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] =
    useState<ValidationErrors<LoginPayload>>({});

  const validate = (data: LoginPayload) => {
    const newErrors:
      ValidationErrors<LoginPayload> = {};

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!data.password.trim()) {
      newErrors.password =
        "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const login = async (
    payload: LoginPayload
  ) => {
    const isValid = validate(payload);

    if (!isValid) return null;

    try {
      setLoading(true);

      const data = await loginUser(payload);

      // Save tokens
      storage.set(
        storage.KEYS.ACCESS_TOKEN,
        data.access
      );

      storage.set(
        storage.KEYS.REFRESH_TOKEN,
        data.refresh
      );

      storage.set(storage.KEYS.USER, data.user);

      return data;
    } catch (error) {
      const err = error as AxiosError<any>;

      if (err.response?.data) {
        setErrors({
          email:
            err.response.data.email?.[0],
          password:
            err.response.data.password?.[0],
        });
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    errors,
  };
}

/* -------------------------------------------------------------------------- */
/*                                     LOGOUT                                  */
/* -------------------------------------------------------------------------- */

export function useLogout() {
  const [loading, setLoading] =
    useState(false);

  const logout = async () => {
    try {
      setLoading(true);

      const refresh =
        storage.get<string>(
          storage.KEYS.REFRESH_TOKEN
        );

      // Call backend logout only if refresh exists
      if (refresh) {
        await logoutUser(refresh);
      }
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      // ALWAYS clear local auth
      storage.remove(
        storage.KEYS.ACCESS_TOKEN
      );

      storage.remove(
        storage.KEYS.REFRESH_TOKEN
      );

      storage.remove(storage.KEYS.USER);

      setLoading(false);
    }
  };

  return {
    logout,
    loading,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 FORGOT PASSWORD                                */
/* -------------------------------------------------------------------------- */

export function useForgotPassword() {
  const [loading, setLoading] =
    useState(false);

  const submitForgotPassword =
    async (email: string) => {
      try {
        setLoading(true);

        return await forgotPassword({
          email,
        });
      } finally {
        setLoading(false);
      }
    };

  return {
    submitForgotPassword,
    loading,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 RESET PASSWORD                                */
/* -------------------------------------------------------------------------- */

export function useResetPassword() {
  const [loading, setLoading] =
    useState(false);

  const submitResetPassword =
    async (
      payload: ResetPasswordPayload
    ) => {
      try {
        setLoading(true);

        return await resetPassword(
          payload
        );
      } finally {
        setLoading(false);
      }
    };

  return {
    submitResetPassword,
    loading,
  };
}