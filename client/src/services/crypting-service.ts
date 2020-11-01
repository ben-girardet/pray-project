import sjcl from 'sjcl';
// TODO: maybe use another (more modern) crypting solution
// More infos: https://medium.com/sharenowtech/high-speed-public-key-cryptography-in-javascript-part-1-3eefb6f91f77

export class CryptingService {


  public static encryptObject(obj: {[key: string]: any}, properties: string[], cryptingKey: string): void {
    for (const key of properties) {
      if (obj[key] !== undefined && typeof obj[key] === 'string') {
        obj[key] = sjcl.encrypt(cryptingKey, obj[key] as string);
      }
    }

  }

  public static decryptObject(obj: {[key: string]: any}, properties: string[], cryptingKey: string): void {
    for (const key of properties) {
      if (typeof obj[key] === 'string') {
        try {
          const decrypted = sjcl.decrypt(cryptingKey, obj[key]);
          obj[key] = decrypted;
        } catch (error) {
          console.error(error);
          throw new Error('Access denied');
        }
      }
    }
  }

}