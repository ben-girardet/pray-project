
export interface User {
    id: string;
    firstname?: string;
    lastname?: string;
    password?: string;
    picture?: {fileId: string, width: number, height: number}[];
    email: string;
    emailValidated?: boolean;
    mobile: string;
    mobileValidated?: boolean;
    roles?: any[];
    state?: number;
    createdAt?: Date;
    createdBy?: string | any; // must be more clearly defined from client / server;
    updatedAt?: Date;
    updatedBy?: string | any; // must be more clearly defined from client / server;
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
