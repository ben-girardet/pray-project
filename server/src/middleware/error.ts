import express from 'express';

export const errorHandler: express.ErrorRequestHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const jsonResp: {
        error: string,
        stack?: any
    } = {
        error: err.message
    };
    if (process.env.NODE_ENV === 'development') {
        jsonResp.stack = err.stack;
    }
    res.status(500);
    res.send(jsonResp);
}
