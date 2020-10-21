export interface User {
    id: string;
    firstname?: string;
    lastname?: string;
    password?: string;
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