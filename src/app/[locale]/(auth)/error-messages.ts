/**
 * Maps Supabase Auth error codes (AuthApiError#code) to translation keys
 * under the `auth.errors` namespace. Unrecognized or missing codes fall
 * back to `generic` rather than ever surfacing a raw Supabase message.
 */
export const AUTH_ERROR_MESSAGE_KEYS: Record<string, string> = {
  invalid_credentials: "invalidCredentials",
  email_not_confirmed: "emailNotConfirmed",
  user_already_exists: "userExists",
  email_exists: "userExists",
  weak_password: "weakPassword",
  email_address_invalid: "invalidEmail",
  over_request_rate_limit: "tooManyRequests",
  over_email_send_rate_limit: "tooManyRequests",
};

export function authErrorMessageKey(code: string | undefined): string {
  return (code && AUTH_ERROR_MESSAGE_KEYS[code]) || "generic";
}
