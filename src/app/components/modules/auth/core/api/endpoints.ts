import { BASE_URL } from "@/src/app/components/services/utils/config";

export const ENDPOINTS = {
  login: `${BASE_URL}/api/v1/login`,
  register: `${BASE_URL}/api/v1/register`,
  google: `${BASE_URL}/api/v1/auth/google`,
  callback: `${BASE_URL}/api/v1/auth/google/callback`,
  profile: `${BASE_URL}/api/v1/profile`,
  verifyemail: `${BASE_URL}/api/v1/verify-email`,
  resendverification: `${BASE_URL}/api/v1/resend-verification`,
  forgotpassword: `${BASE_URL}/api/v1/forgot-password`,
  resetpassword: `${BASE_URL}/api/v1/reset-password`,
  verifycode: `${BASE_URL}/api/v1/verify-code`,
  facebook: `${BASE_URL}/api/v1/auth/facebook`,
  callbackfacebook: `${BASE_URL}/api/v1/auth/facebook/callback`,
  broadcastingAuth: "/api/broadcasting/auth",
};
