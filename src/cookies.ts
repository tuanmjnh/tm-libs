const crypto = require('crypto-js')
let ITERATIONS, dpapi
const KEYLENGTH = 16,
  SALT = 'saltysalt'

export const encryptCookie = (cookie: any, key: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encryptedCookie = Buffer.concat(
    [
      Buffer.from('v10'),         // prefix
      iv,                         // 12 bytes nonce
      cipher.update(cookie),      // cookie data
      cipher.final(),
      cipher.getAuthTag()         // 16 bytes authentication
    ]);
  return encryptedCookie;
}

export const decryptCookie = (encryptedCookie: any, key: string) => {
  const prefix = encryptedCookie.slice(0, 3);                                     // prefix
  const iv = encryptedCookie.slice(3, 3 + 12);                                    // 12 bytes nonce
  const ciphertext = encryptedCookie.slice(3 + 12, encryptedCookie.length - 16);  // encrypted cookie
  const authTag = encryptedCookie.slice(encryptedCookie.length - 16);             // 12 bytes authentication tag
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decryptedCookie = Buffer.concat(
    [
      decipher.update(ciphertext),      // encrypted cookie
      decipher.final(),
    ]);
  return decryptedCookie;
}

export const getDerivedKey = (callback: Function) => {
  let keytar, chromePassword
  // console.log(process.platform)
  if (process.platform === 'darwin') {

    // keytar = require('keytar');
    const key = keytar.getPassword('Chrome Safe Storage', 'Chrome').then(function (chromePassword: any) {
      crypto.pbkdf2(chromePassword, SALT, ITERATIONS, KEYLENGTH, 'sha1', callback)
    })
  } else if (process.platform === 'linux') {

    chromePassword = 'peanuts';
    crypto.pbkdf2(chromePassword, SALT, ITERATIONS, KEYLENGTH, 'sha1', callback);

  } //else if (process.platform === 'win32') {

  // On Windows, the crypto is managed entirely by the OS.  We never see the keys.
  //   dpapi = require('win-dpapi');
  //   callback(null, null);
  // }
}
/*

// Encryption
const cookie = Buffer.from('The test cookie with some data');
const key = Buffer.from('01234567890123456789012345678901');
const encryptedCookie = encryptCookie(cookie, key);
console.log(encryptedCookie);
console.log(encryptedCookie.length);

// Decryption
const decryptedCookie = decryptCookie(encryptedCookie, key);
console.log(decryptedCookie.toString('utf8'));
*/
