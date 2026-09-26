import nacl from "tweetnacl";

/**
 * Verifies GoHighLevel Ed25519 webhook signatures passed in X-GHL-Signature header.
 * The signature and public key can be either hex or base64 encoded.
 */
export function verifyGhlWebhookSignature(
  rawPayload: string,
  signatureHeader: string | null,
  publicKeyHexOrBase64: string | null
): boolean {
  if (!signatureHeader || !publicKeyHexOrBase64) {
    return false;
  }

  try {
    const messageUint8 = new TextEncoder().encode(rawPayload);

    // Parse signature (try hex first, fallback to base64)
    let signatureUint8: Uint8Array;
    if (/^[0-9a-fA-F]+$/.test(signatureHeader)) {
      signatureUint8 = Buffer.from(signatureHeader, "hex");
    } else {
      signatureUint8 = Buffer.from(signatureHeader, "base64");
    }

    // Parse public key (try hex first, fallback to base64)
    let publicKeyUint8: Uint8Array;
    if (/^[0-9a-fA-F]+$/.test(publicKeyHexOrBase64)) {
      publicKeyUint8 = Buffer.from(publicKeyHexOrBase64, "hex");
    } else {
      publicKeyUint8 = Buffer.from(publicKeyHexOrBase64, "base64");
    }

    if (signatureUint8.length !== 64 || publicKeyUint8.length !== 32) {
      return false;
    }

    return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
  } catch (error) {
    console.error("GHL Ed25519 signature verification error:", error);
    return false;
  }
}
