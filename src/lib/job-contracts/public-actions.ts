import { createClient as createSupabaseClient } from "@/lib/supabase/client";

export type SignContractResult = { success: true } | { success: false; error: string };

/**
 * Called from the public, unauthenticated `/contracts` signing page. The
 * access_token itself is the credential — see sign_contract() in the DB,
 * which is deliberately grant(ed) to anon for exactly this reason.
 */
export async function signContractAction(
  token: string,
  signerName: string,
  signatureDataUrl: string
): Promise<SignContractResult> {
  if (!signerName.trim() || !signatureDataUrl) {
    return { success: false, error: "validation" };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase.rpc("sign_contract", {
    p_token: token,
    p_signer_name: signerName.trim(),
    p_signature_data_url: signatureDataUrl,
  });

  if (error) return { success: false, error: "sign_failed" };

  return { success: true };
}
