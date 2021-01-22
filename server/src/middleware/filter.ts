import express from 'express';
import * as Sentry from '@sentry/node';

// TODO: add a rate limiter
// https://www.npmjs.com/package/express-rate-limit
// https://www.npmjs.com/package/rate-limit-redis
// https://www.npmjs.com/package/express-slow-down

export const filter = () => (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const last4 = req.url.substr(0, 4);
    const last5 = req.url.substr(0, 5);
    if (last4 === '.php' || last4 === '.txt') {
        const transaction = Sentry.startTransaction({
            op: 'Filter',
            name: `*.${last4}`
        });
        transaction.setTag('url', req.url);
        Sentry.configureScope(scope => scope.setSpan(transaction));
        transaction.finish();
        setTimeout(() => {
            next(new Error('Invalid request'))
        }, 2000);
        return;
    } else if (last5 === '.html') {
        const transaction = Sentry.startTransaction({
            op: 'Filter',
            name: `*.${last5}`
        });
        transaction.setTag('url', req.url);
        Sentry.configureScope(scope => scope.setSpan(transaction));
        transaction.finish();
        setTimeout(() => {
            next(new Error('Invalid request'))
        }, 2000);
        return;
    }

    next();
};
