import { Request, Response } from 'express';

export interface Context {
    req: Request;
    res: Response;
    user: {
        userId: string;
        roles: string[]
    },
    locals: {[key: string]: any}
}
