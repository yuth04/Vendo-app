import {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  User,
} from "@/src/app/components/modules/auth/core/models/authModel";
import { ENDPOINTS } from "@/src/app/components/modules/auth/core/api/endpoints";
import { apiClient } from "@/src/app/components/services/api/apiClient";
import Pusher, { Channel } from "pusher-js";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const PENDING_EMAIL_KEY = "pending_verification_email";
const PENDING_RESET_EMAIL_KEY = "pending_reset_email";
const RESET_TOKEN_KEY = "reset_token";

const notifyAuthUpdate = (reason?: string) => {
  if (typeof window !== "undefined") {
    // 1. Dispatch custom event for UI components to listen to
    window.dispatchEvent(
      new CustomEvent("auth-updated", { detail: { reason } }),
    );

    // 2. Automatically redirect user to login page on expiration or deactivation
    if (reason === "expired" || reason === "deactivated") {
      const currentPath = window.location.pathname;
      if (
        !currentPath.startsWith("/login") &&
        !currentPath.startsWith("/auth")
      ) {
        console.warn(
          `[Auth] Session ended due to reason: ${reason}. Redirecting to login.`,
        );
        window.location.href = `/login?reason=${reason}`;
      }
    }
  }
};

//--- Token expiry helpers ---//

const decodeJwt = (token: string): Record<string, any> | null => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
};

let _expiryTimer: ReturnType<typeof setTimeout> | null = null;

export const scheduleAutoLogout = (
  token: string,
  onExpire: () => void,
): void => {
  if (_expiryTimer) clearTimeout(_expiryTimer);

  const payload = decodeJwt(token);
  if (!payload?.exp) return;

  const msUntilExpiry = payload.exp * 1000 - Date.now();
  if (msUntilExpiry <= 0) {
    onExpire();
    return;
  }

  _expiryTimer = setTimeout(() => {
    onExpire();
  }, msUntilExpiry);
};

// ============================================================
// Realtime deactivation watcher (Pusher)
// ============================================================

let _pusher: Pusher | null = null;
let _userChannel: Channel | null = null;

const teardownPusherWatcher = (): void => {
  if (_userChannel) {
    _userChannel.unbind_all();
    _userChannel = null;
  }

  if (_pusher) {
    _pusher.disconnect();
    _pusher = null;
  }
};

const initPusherWatcher = (user: User): void => {
  if (typeof window === "undefined" || !user?.id) {
    return;
  }

  // Prevent duplicate Pusher connections
  teardownPusherWatcher();

  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;

  if (!pusherKey || !pusherCluster) {
    console.error("[Pusher] Missing Pusher environment variables");
    return;
  }

  console.log(`[Pusher] Starting watcher for user ${user.id}`);

  _pusher = new Pusher(pusherKey, {
    cluster: pusherCluster,
    authorizer: (channel) => {
      return {
        authorize: async (socketId, callback) => {
          try {
            // Get token dynamically within the callback execution scope
            const token = localStorage.getItem(TOKEN_KEY);

            if (!token) {
              console.warn(
                "[Pusher] No auth token found during channel authorization",
              );
              const err = new Error("No auth token available");
              (err as any).status = 401;
              callback(err, null);
              return;
            }

            console.log("[Pusher] Authorizing channel:", channel.name);

            const response = await apiClient.post<{
              auth: string;
              channel_data?: string;
            }>(
              ENDPOINTS.broadcastingAuth,
              {
                socket_id: socketId,
                channel_name: channel.name,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              },
            );

            if (response.error || !response.data?.auth) {
              console.error(
                "[Pusher] Channel auth failed:",
                response.error || response,
              );

              const authError = new Error(
                response.error?.message || "Channel auth failed",
              );
              (authError as any).status = response.error?.status || 403;

              callback(authError, null);
              return;
            }

            console.log("[Pusher] Channel authorized successfully");
            callback(null, response.data);
          } catch (error: any) {
            console.error("[Pusher] Authorization exception:", error);

            const err =
              error instanceof Error
                ? error
                : new Error("Broadcasting authorization exception");
            (err as any).status = error?.response?.status || 500;

            callback(err, null);
          }
        },
      };
    },
  });

  const channelName = `private-user.${user.id}`;

  console.log("[Pusher] Subscribing:", channelName);

  _userChannel = _pusher.subscribe(channelName);

  _userChannel.bind("pusher:subscription_succeeded", () => {
    console.log(`[Pusher] Successfully subscribed to ${channelName}`);
  });

  _userChannel.bind("pusher:subscription_error", (error: any) => {
    console.error("[Pusher] Subscription error:", error);
  });

  _userChannel.bind("user.deactivated", () => {
    console.log("🚨 ACCOUNT DEACTIVATED BY ADMIN");

    // Immediately teardown Pusher socket connection
    teardownPusherWatcher();

    // Immediately trigger local logout with reason
    authClient.logout("deactivated");
  });
};

export const authClient = {
  //--------- App Initialization Helper ---------//
  initializeAuth: (): User | null => {
    const user = authClient.getStoredUser();
    if (user) {
      initPusherWatcher(user);
    }
    return user;
  },

  //--------- Login ----------//
  login: async (
    credentials: LoginCredentials,
  ): Promise<LoginResponse | null> => {
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.login,
      credentials,
    );
    if (response.error || !response.data) throw response.error;

    const { user } = response.data;
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, user.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      scheduleAutoLogout(user.token, () => authClient.logout("expired"));
      initPusherWatcher(user);
    }
    notifyAuthUpdate();
    return response.data;
  },

  //------ Google OAuth Handler ---------//
  handleGoogleCallback: async (userData: any, token: string): Promise<void> => {
    if (typeof window !== "undefined") {
      const normalizedUser: User = {
        ...userData,
        first_name:
          userData.first_name || userData.name?.split(" ")[0] || "User",
        last_name:
          userData.last_name ||
          userData.name?.split(" ").slice(1).join(" ") ||
          "",
        token,
      };
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      scheduleAutoLogout(token, () => authClient.logout("expired"));
      initPusherWatcher(normalizedUser);
      notifyAuthUpdate();
    }
  },

  //------ Google Login Redirect ---------//
  loginWithGoogle: (): void => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = `${ENDPOINTS.google}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  },

  //----- Helpers --------//
  getStoredUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && isTokenExpired(token)) {
      authClient.logout("expired");
      return null;
    }
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || raw === "undefined" || raw === "null") return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && isTokenExpired(token)) {
      authClient.logout("expired");
      return null;
    }
    return token;
  },

  setResetToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(RESET_TOKEN_KEY, token);
    }
  },

  logout: (reason?: string): void => {
    // Clear auto-logout timer
    if (_expiryTimer) {
      clearTimeout(_expiryTimer);
      _expiryTimer = null;
    }

    // Stop Pusher connection
    teardownPusherWatcher();

    // Clear authentication tokens & user state
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Notify React state listeners and trigger redirect if expired/deactivated
    notifyAuthUpdate(reason);
  },

  //--------- Register Account--------//
  register: async (
    credentials: RegisterCredentials,
  ): Promise<RegisterResponse | null> => {
    const response = await apiClient.post<RegisterResponse>(
      ENDPOINTS.register,
      credentials,
    );
    if (response.error || !response.data) {
      throw {
        response: {
          data: {
            message: response.error?.message || "Registration failed.",
            errors: (response.error as any)?.data?.errors ?? null,
          },
        },
      };
    }
    localStorage.setItem(PENDING_EMAIL_KEY, credentials.email);
    try {
      await apiClient.post(ENDPOINTS.resendverification, {
        email: credentials.email,
      });
    } catch (resendErr: any) {
      console.warn(
        "[Auth] resend-verification call failed:",
        resendErr?.response?.data,
      );
    }
    return response.data;
  },

  //-------- Verify Email (registration flow) --------//
  verifyEmail: async (
    email: string,
    verification_code: string,
  ): Promise<LoginResponse | null> => {
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.verifyemail,
      {
        email,
        verification_code,
      },
    );
    if (response.error || !response.data) {
      throw {
        response: {
          data: {
            message: response.error?.message || "Invalid or expired code.",
            errors: (response.error as any)?.data?.errors ?? null,
          },
        },
      };
    }
    const data = response.data;
    if (data?.user?.token) {
      localStorage.setItem(TOKEN_KEY, data.user.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.removeItem(PENDING_EMAIL_KEY);
      scheduleAutoLogout(data.user.token, () => authClient.logout("expired"));
      initPusherWatcher(data.user);
      notifyAuthUpdate();
    }
    return data;
  },

  //------- Resend Verification Code -----------//
  resendVerification: async (
    email: string,
  ): Promise<{ message: string } | null> => {
    const response = await apiClient.post<{ message: string }>(
      ENDPOINTS.resendverification,
      { email },
    );
    return response.data ?? null;
  },

  //----- Email Helpers --------//
  getPendingEmail: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(PENDING_EMAIL_KEY);
  },

  // -------- Forgot Password --------//
  forgotPassword: async (
    email: string,
  ): Promise<{ message: string } | null> => {
    const response = await apiClient.post<{ message: string }>(
      ENDPOINTS.forgotpassword,
      { email },
    );
    if (response.error || !response.data) {
      throw {
        response: {
          data: {
            message: response.error?.message || "Failed to send reset email.",
            errors: (response.error as any)?.data?.errors ?? null,
          },
        },
      };
    }
    localStorage.setItem(PENDING_RESET_EMAIL_KEY, email);
    return response.data;
  },

  // -------- Verify Reset Code --------//
  verifyResetCode: async (
    email: string,
    code: string,
  ): Promise<{ message: string; reset_token?: string } | null> => {
    const response = await apiClient.post<{
      message: string;
      reset_token?: string;
    }>(ENDPOINTS.verifycode, { email, code });
    if (response.error || !response.data) {
      throw {
        response: {
          data: {
            message: response.error?.message || "Invalid or expired code.",
            errors: (response.error as any)?.data?.errors ?? null,
          },
        },
      };
    }
    if (response.data?.reset_token) {
      localStorage.setItem(RESET_TOKEN_KEY, response.data.reset_token);
    }
    return response.data;
  },

  // -------- Reset Password --------//
  resetPassword: async (
    password: string,
    password_confirmation: string,
  ): Promise<{ message: string } | null> => {
    const resetToken =
      typeof window !== "undefined"
        ? localStorage.getItem(RESET_TOKEN_KEY)
        : null;
    const email =
      typeof window !== "undefined"
        ? localStorage.getItem(PENDING_RESET_EMAIL_KEY)
        : null;

    const payload: Record<string, string> = { password, password_confirmation };
    if (email) payload.email = email;
    if (resetToken) payload.reset_token = resetToken;

    const response = await apiClient.post<{ message: string }>(
      ENDPOINTS.resetpassword,
      payload,
    );
    if (response.error || !response.data) {
      throw {
        response: {
          data: {
            message: response.error?.message || "Failed to reset password.",
            errors: (response.error as any)?.data?.errors ?? null,
          },
        },
      };
    }
    localStorage.removeItem(PENDING_RESET_EMAIL_KEY);
    localStorage.removeItem(RESET_TOKEN_KEY);
    return response.data;
  },

  //----- Reset-flow Helpers --------//
  getPendingResetEmail: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(PENDING_RESET_EMAIL_KEY);
  },

  getResetToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(RESET_TOKEN_KEY);
  },

  //------ Facebook Login Redirect ---------//
  loginWithFacebook: (): void => {
    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    window.location.href = `${ENDPOINTS.facebook}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  },

  //------ Facebook OAuth Handler ---------//
  handleFacebookCallback: async (
    userData: any,
    token: string,
  ): Promise<void> => {
    if (typeof window !== "undefined") {
      const normalizedUser: User = {
        ...userData,
        first_name:
          userData.first_name || userData.name?.split(" ")[0] || "User",
        last_name:
          userData.last_name ||
          userData.name?.split(" ").slice(1).join(" ") ||
          "",
        token,
      };
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      scheduleAutoLogout(token, () => authClient.logout("expired"));
      initPusherWatcher(normalizedUser);
      notifyAuthUpdate();
    }
  },

  //-------- Realtime deactivation watcher --------//
  initPusherWatcher,
  teardownPusherWatcher,
};
