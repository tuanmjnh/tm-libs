import CryptoJS from "crypto-js";
import bcrypt from "bcryptjs";

export const SECRET = "48955e33-5871-3982-3c1e-e127e7714958";

export const MD5Hash = (val: string, secret?: string) =>
  CryptoJS.MD5(val + (secret || "")).toString();

export const SHA256 = (val: string) =>
  CryptoJS.SHA256(val).toString();

export const Base64Encode = (str: string) =>
  btoa(unescape(encodeURIComponent(str)));

export const Base64Decode = (str: string) =>
  decodeURIComponent(escape(atob(str)));

export const NewGuid = (n?: boolean) => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(-4);
  return n
    ? `${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}`
    : `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export const NewToken = () => {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
};

export const createPassword = async (password: string, salt?: string, lengthSalt = 10) => {
  salt = salt || bcrypt.genSaltSync(lengthSalt);
  const hashed = await bcrypt.hash(password, salt);
  return { password: hashed, salt };
};
