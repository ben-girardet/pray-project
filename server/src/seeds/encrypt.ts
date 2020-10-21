import Gun from 'gun';
import 'gun/sea';
import sjcl from 'sjcl';
import { customAlphabet } from 'nanoid';
const contentKeyGen = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.,;:!+*%&/()=?', 10);

export interface SeaPair {
    priv: string;
    pub: string;
    epriv: string;
    epub: string;
  }

export class Encrypt {

  public static async generatePair(): Promise<SeaPair> {
    const SEA = Gun.SEA;
    return new Promise((resolve) => {
      SEA.pair((pair) => {
        resolve(pair as unknown as SeaPair);
      });
    });
  }

  public static async encryptWithPair(message: string, writerPair: SeaPair, receiverPub: string): Promise<string> {
    const SEA = Gun.SEA;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await SEA.encrypt(message, (SEA as any).secret(receiverPub, writerPair));
    return data;
  }

  public static generateKey(): string {
    return contentKeyGen();
  }

  public static async decryptWithPair(encryptedMessage: string, receiverPair: SeaPair, writerPub: string): Promise<string> {
    const SEA = Gun.SEA;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const key = await SEA.decrypt(encryptedMessage, (SEA as any).secret(writerPub, receiverPair));
    if (typeof key === 'string') {
        return key;
    }
    throw new Error('Not permitted to decrypt this message');
  }

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
