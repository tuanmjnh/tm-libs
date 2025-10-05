import crypto from "crypto";

const ITERATIONS = 1003;
const KEYLENGTH = 16;
const SALT = "saltysalt";

/**
 * Mã hóa cookie (AES-256-GCM)
 */
export const encryptCookie = (cookie: Buffer | string, key: Buffer) => {
  const iv = crypto.randomBytes(12); // 12 bytes nonce
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(cookie),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return Buffer.concat([
    Buffer.from("v10"), // prefix
    iv,                 // 12 bytes nonce
    encrypted,          // ciphertext
    authTag,            // 16 bytes tag
  ]);
};

/**
 * Giải mã cookie
 */
export const decryptCookie = (encryptedCookie: Buffer, key: Buffer) => {
  const prefix = encryptedCookie.slice(0, 3);
  if (prefix.toString() !== "v10")
    throw new Error("Invalid prefix (expected v10)");

  const iv = encryptedCookie.slice(3, 15); // 12 bytes nonce
  const authTag = encryptedCookie.slice(-16); // 16 bytes auth tag
  const ciphertext = encryptedCookie.slice(15, -16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted;
};

/**
 * Lấy key mã hóa Chrome (Linux, macOS)
 * - macOS dùng keytar
 * - Linux dùng mật khẩu mặc định "peanuts"
 */
export const getDerivedKey = async (): Promise<Buffer> => {
  let chromePassword: string;

  if (process.platform === "darwin") {
    const keytar = await import("keytar");
    const password = await keytar.default.getPassword("Chrome Safe Storage", "Chrome");
    if (!password) throw new Error("Không tìm thấy mật khẩu Chrome Safe Storage");
    chromePassword = password;
  } else if (process.platform === "linux") {
    chromePassword = "peanuts";
  } else {
    // Windows sử dụng DPAPI, không cần key
    throw new Error("Windows sử dụng DPAPI, không cần derived key");
  }

  return await new Promise((resolve, reject) => {
    crypto.pbkdf2(chromePassword, SALT, ITERATIONS, KEYLENGTH, "sha1", (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
};

/**
 * Ví dụ sử dụng:
 */
async function example() {
  const key = crypto.randomBytes(32); // AES-256 => 32 bytes
  const cookie = Buffer.from("The test cookie with some data", "utf8");

  const encrypted = encryptCookie(cookie, key);
  console.log("🔒 Encrypted:", encrypted.toString("base64"));

  const decrypted = decryptCookie(encrypted, key);
  console.log("🔓 Decrypted:", decrypted.toString("utf8"));
}

// example();
export { };