import { DocumentType } from '@typegoose/typegoose';
import path from 'path';
import PushNotifications from 'node-pushnotifications';
import { PushNotification, PushNotificationModel } from '../models/push-notification';
import { PushPlayerModel } from '../models/push-player';
import express from 'express';
let debug = require('debug')('app:push');

const privatePath = path.join(__dirname, `../../private/`);

export class PushService {

    private push: PushNotifications;
    private connected = false;

    public isConnected() {
        return this.connected;
    }

    public connect() {
        if (this.connected) {
            return;
        }
        debug('connect');
        if (process.env.APN_KEY && process.env.APN_KEYID && process.env.APN_TEAMID) {
            const settings: PushNotifications.Settings = {
                apn: {
                    token: {
                        key: privatePath + process.env.APN_KEY,
                        keyId: process.env.APN_KEYID,
                        teamId: process.env.APN_TEAMID
                    },
                    production: false
                }
            };
            this.push = new PushNotifications(settings);
            // TODO: add GCM config
            this.connected = true;
        }

    }

    public disconnect() {
        debug('disconnect');
        try {
            (this.push as any).apn.shutdown();
        } catch (error) {
            console.error(error);
        }
        this.connected = false;
      }

      public async send(notification: DocumentType<PushNotification>): Promise<any> {
        let data: PushNotifications.Data = {
            title: notification.title,
            body: notification.message,
            topic: 'app.sunago',
        };
        if (notification.collapseKey !== undefined) {
            data.collapseKey = notification.collapseKey;
        }
        if (notification.contentAvailable !== undefined) {
            data.contentAvailable = notification.contentAvailable;
        }
        if (notification.badge !== undefined) {
            data.badge = notification.badge;
        }
        if (notification.custom) {
            try {
                let custom = JSON.parse(notification.custom);
                data.custom = custom;
            } catch (error) {
                (data.custom as any) = {data: notification.custom};
            }
        } else {
            data.custom = {};
        }
        (data.custom as any).notId = notification._id.toString();

        const results = await this.push.send(notification.regIds, data);
        let successRegId: Array<string> = [];
        for (let result of results) {
            for (let message of result.message) {
                let tmp = message.regId;
                let regId: string;
                if (typeof tmp === 'string') {
                    regId = tmp;
                } else {
                    regId = (tmp as any).device;
                }
                debug('regId', regId);
                if (message.error === null) {
                    debug('-> sent ok');
                    successRegId.push(regId);
                } else if (message.error instanceof Error) {
                    debug('-> sent error');
                    if (message.error.message === 'InvalidRegistration' || message.error.message === 'BadDeviceToken') {
                        debug('-> make player inactive', regId);
                        const player = await PushPlayerModel.findOne({regId: regId});
                        if (player) {
                            player.active = false;
                            await player.save();
                        }
                    } else {
                        debug('-> error message', message.error.message);
                        debug('message', message);
                    }
                }
            }
        }

        notification.sentToRegIds = successRegId;
        notification.sent = true;
        notification.sentAt = new Date();
        return await notification.save();
    }

}

const pushService = new PushService();

export { pushService };

function testPush(req: express.Request, res: express.Response, next: express.NextFunction) {
    new Promise(async (resolve, reject) => {
        try {
            const players = await PushPlayerModel.find({active: true, tags: {$in: ['test']}});
            const regIds = players.map(p => p.regId);

            const notification = new PushNotificationModel();
            notification.regIds = regIds;
            notification.title = 'Test notification title';
            notification.message = 'Test notification message';

            const notificationDocument = await notification.save();
            const createdNotification = new PushNotificationModel(notificationDocument);

            const sentNotification = await pushService.send(createdNotification);

            res.send(new PushPlayerModel(sentNotification).toObject());
            resolve(null);
        } catch (error) {
            reject(error);
        }
    }).then(next).catch(next);

}

export { testPush };
