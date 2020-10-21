import jwt from 'jsonwebtoken';

export const isValidToken = (token: any) => {
    try {
        // @ts-expect-error
        jwt.verify(token, process.env.JWT_SECRET_OR_KEY);
        return true;
    } catch (error) {
        // error
        return false;
    }
};

export const retrieveToken = (headers: any) => {
    if (headers && headers.authorization) {
        const tokens = headers.authorization.split(' ');
        if (tokens && tokens.length === 2) {
            return tokens[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

// @ts-expect-error
export const decodeToken = (token: string): any => jwt.verify(token, process.env.JWT_SECRET_OR_KEY);

export const decodeRefreshToken = (token: string): any => {
    try {
        // @ts-expect-error
        return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY);
    } catch (error) {
        return null;
    }
};

export const createToken = (payload: any) => {
    try {
        // @ts-expect-error
        return jwt.sign(payload, process.env.JWT_SECRET_OR_KEY, { expiresIn: process.env.JWT_TOKEN_EXPIRATION });
    } catch (error) {
        return null;
    }
};

export const createRefreshToken = (payload: any) => {
    try {
        // @ts-expect-error
        return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY, { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION });
    } catch (error) {
        return null;
    }
};