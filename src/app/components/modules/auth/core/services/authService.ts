import {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  User,
} from "@/src/app/components/modules/auth/core/models/authModel";
import {
  authClient,
  scheduleAutoLogout,
} from "@/src/app/components/modules/auth/core/api/authClient";

export const authService = {
  //--------- Login ----------//
  login: async (
    credentials: LoginCredentials,
  ): Promise<LoginResponse | null> => {
    return await authClient.login(credentials);
  },

  //------ Google OAuth Handlers ---------//
  loginWithGoogle: (): void => {
    authClient.loginWithGoogle();
  },

  handleGoogleCallback: async (userData: any, token: string): Promise<void> => {
    await authClient.handleGoogleCallback(userData, token);
  },

  //--------- Register Account --------//
  register: async (
    credentials: RegisterCredentials,
  ): Promise<RegisterResponse | null> => {
    return await authClient.register(credentials);
  },

  //-------- Verify Email --------//
  verifyEmail: async (
    email: string,
    verificationCode: string,
  ): Promise<LoginResponse | null> => {
    return await authClient.verifyEmail(email, verificationCode);
  },

  //------- Resend Verification Code -----------//
  resendVerification: async (
    email: string,
  ): Promise<{ message: string } | null> => {
    return await authClient.resendVerification(email);
  },

  // -------- Forgot Password --------//
  forgotPassword: async (
    email: string,
  ): Promise<{ message: string } | null> => {
    return await authClient.forgotPassword(email);
  },

  // -------- Verify Reset Code --------//
  verifyResetCode: async (
    email: string,
    code: string,
  ): Promise<{ message: string; reset_token?: string } | null> => {
    return await authClient.verifyResetCode(email, code);
  },

  // -------- Reset Password --------//
  resetPassword: async (
    password: string,
    passwordConfirmation: string,
  ): Promise<{ message: string } | null> => {
    return await authClient.resetPassword(password, passwordConfirmation);
  },

  //----- Storage Helpers & Getters --------//
  getStoredUser: (): User | null => {
    return authClient.getStoredUser();
  },
  setResetToken: (token: string): void => {
    authClient.setResetToken(token);
  },

  getToken: (): string | null => {
    return authClient.getToken();
  },

  logout: (reason?: string): void => {
    authClient.logout(reason);
  },

  getPendingEmail: (): string | null => {
    return authClient.getPendingEmail();
  },

  getPendingResetEmail: (): string | null => {
    return authClient.getPendingResetEmail();
  },

  getResetToken: (): string | null => {
    return authClient.getResetToken();
  },

  // -------- Init Token Watcher (call once on app mount) --------//
  initTokenWatcher: (): void => {
    const token = authClient.getToken();
    if (token) {
      scheduleAutoLogout(token, () => authClient.logout("expired"));
    }
  },

  //------ Facebook OAuth Handlers ---------//
  loginWithFacebook: (): void => {
    authClient.loginWithFacebook();
  },

  handleFacebookCallback: async (
    userData: any,
    token: string,
  ): Promise<void> => {
    await authClient.handleFacebookCallback(userData, token);
  },

  // -------- Init Pusher Watcher (added, call once on app mount / after login) --------//
  initPusherWatcher: (): void => {
    const user = authClient.getStoredUser();
    if (user) {
      authClient.initPusherWatcher(user);
    }
  },
};