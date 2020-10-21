import dotenv from 'dotenv';
import Mailgun from 'mailgun-js';
import { config } from './config';

dotenv.config();

// @ts-expect-error
export const mail = config.ENABLE_MAIL ? new Mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN }) : null as Mailgun.Mailgun;

export const send = (from: string, to: string, subject: string, body: string, attachment?: any) => {
    return new Promise((resolve, reject) => {
        const config = {
            from,
            to,
            subject,
            html: body
        };

        if (attachment) {
            (config as any).attachment = attachment;
        }

        mail.messages().send(config, (err, body) => {
            if (err) {
                return reject(err);
            }

            resolve(body);
        });
    });
};

export const addToMailingList = (members: any[], listName: string) => {
    return new Promise((resolve, reject) => {
        mail.lists(listName).members().add({members}, (err, body) => {
            if (err) {
                return reject(err);
            }

            resolve(body);
        });
    });
};