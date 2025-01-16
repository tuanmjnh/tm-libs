// const crypto = require('crypto')
// import { createHash, createHmac, randomBytes } from "crypto"
import CryptoJS from 'crypto-js'
export const SECRET = '48955e33-5871-3982-3c1e-e127e7714958'
interface NewGuidOptions {
  format: string
}
export const MD5Hash = (val: string, secret?: string) => {
  return CryptoJS.MD5(`${val}${secret ? secret : ''}`).toString()
}

export const SHA256 = (val: string) => {
  return CryptoJS.SHA256(val).toString()
}

export const Base64Encode = (str: string) => {
  return Buffer.from(str).toString('base64')
}

export const Base64Decode = (str: string) => {
  return Buffer.from(str, 'base64').toString('ascii')
}

export const NewGuid = (otps?: NewGuidOptions) => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  if (otps && otps.format && otps.format.toLowerCase() === 'n') {
    return `${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}`
  } else {
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
  }
}

export const NewToken = () => {
  return CryptoJS.lib.WordArray.random(64).toString(CryptoJS.enc.Hex)
}
