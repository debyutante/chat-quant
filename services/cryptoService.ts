// Wrapper for Web Crypto API to simulate robust encryption

export const generateAESKey = async (): Promise<CryptoKey> => {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptMessage = async (message: string, key: CryptoKey): Promise<{ cipherText: string; iv: string }> => {
  const encoded = new TextEncoder().encode(message);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );

  return {
    cipherText: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
  };
};

export const decryptMessage = async (cipherText: string, ivStr: string, key: CryptoKey): Promise<string> => {
  try {
    const encryptedData = base64ToArrayBuffer(cipherText);
    const iv = base64ToArrayBuffer(ivStr);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      key,
      encryptedData
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (e) {
    console.error("Decryption failed:", e);
    return "Error: Could not decrypt message.";
  }
};

// Helpers
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}