import { inject, ILogger } from 'aurelia';
import moment from 'moment';
import Gun from 'gun';
import 'gun/lib/unset';
import 'gun/lib/then';
import 'gun/sea';

import { GunState, MainRefs, SeaPair, IModel } from './internals';
import { IGunChainReference } from 'gun/types/chain';

@inject()
export class GunService {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public gun: IGunChainReference<GunState, any, "pre_root">;
  private peers: Array<string> = [];

  private logger: ILogger;

  public constructor(@ILogger iLogger: ILogger) {
    this.logger = iLogger.scopeTo('gun-service');
  }

  public setPeers(peers: Array<string>): this {
    this.peers = peers;
    if (this.gun) {
      this.gun.opt({peers: this.peers});
    }
    return this;
  }

  public start(): this {
    if (this.gun) {
      return;
    }
    const localStorage = true;
    this.logger.info('Starting GUN with ', this.peers, 'peers');
    this.logger.info('GUN using localStorage', localStorage);
    this.gun = new Gun<GunState>({
      peers: this.peers,
      localStorage
    });
    return this;
  }

  public async exists(modelKey: MainRefs, modelId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = await this.gun.get(modelKey).get(modelId).then();
    if (item) {
      return true;
    }
    return false;
  }

  public async encryptWithPair(message: string, writerPair: SeaPair, receiverPub: string): Promise<string> {
    const SEA = Gun.SEA;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await SEA.encrypt(message, (SEA as any).secret(receiverPub, writerPair));
    return data;
  }

  public async decryptWithPair(encryptedMessage: string, receiverPair: SeaPair, writerPub: string): Promise<string> {
    const SEA = Gun.SEA;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const key = await SEA.decrypt(encryptedMessage, (SEA as any).secret(writerPub, receiverPair));
    if (typeof key === 'string') {
      return key;
    }
    throw new Error('Not permitted to decrypt this message');
  }

  public async genPair(): Promise<SeaPair> {
    const SEA = Gun.SEA;
    return new Promise((resolve) => {
      SEA.pair((pair) => {
        resolve(pair as unknown as SeaPair);
      });
    });
  }

  public changeIdentity(model: IModel, userId: string): IModel {
    const date = moment().toISOString();
    if (!model.creationDate) {
      model.creationDate = date
    }
    if (!model.author) {
      model.author = userId;
    }
    model.lastUpdateDate = date;
    model.lastUpdateAuthor = userId;
    return model;
  }

  public sort(models: IModel[], key: string): IModel[] {
    models.sort((a, b) => {
      let direction = 1;
      if (key.substr(0, 1) === '-') {
        direction = -1;
        key = key.substr(1);
      }
      let va = a[key];
      let vb = b[key];
      if (key.toLowerCase().indexOf('date') !== -1) {
        va = moment(va).unix();
        vb = moment(vb).unix();
      }
      if (typeof va === 'string') {
        va = va.toLowerCase();
      }
      if (typeof va === 'string') {
        vb = vb.toLowerCase();
      }
      let sort: -1 | 0 | 1;
      if (va > vb) {
        sort = -1
      } else if (vb < va) {
        sort = 1;
      } else {
        sort = 0
      }
      return sort * direction;
    });
    return models;
  }
}
