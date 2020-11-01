import { Image } from '../../server/src/models/image';

export interface User {
    id: string;
    firstname?: string;
    lastname?: string;
    password?: string;
    picture?: Image[];
    email: string;
    emailValidated?: boolean;
    mobile: string;
    mobileValidated?: boolean;
    roles?: any[];
}

export interface TokenUserPayload {
    userId?: number | string;
    sub?: number;
    iat?: number;
    exp?: number;
    expiry?: number;
    email: string;
    firstname: string;
    lastname: string;
    picture: string | null;
    claims: string[];
}