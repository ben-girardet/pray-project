import { Response } from 'express';
import { RefreshTokenData, UserModel } from "../models/user";
import { Login } from "../models/login";
import { Resolver, Mutation, Ctx, Arg, AuthChecker } from "type-graphql";
import jwt from 'jsonwebtoken';
import { Context } from './context-interface';
import crypto from 'crypto';
import moment from 'moment';


@Resolver()
export class AuthResolver {

    @Mutation(() => Login)
    public async login(@Arg('username') username: string, @Arg('password') password: string, @Ctx() context: Context) {
        const user = await UserModel
            .findOne({$or: [
                {email: username, emailValidated: true},
                {mobile: username, mobileValidated: true}]})
            .select('refreshTokens salt hash roles privateKey state');
        if (!user) {
            throw new Error('User not found');
        }
        const passwordValid = user.isPasswordValid(password);
        if (!passwordValid) {
            throw new Error('Invalid password');
        }
        const refreshTokenData = user.generateRefreshToken();
        await user.save();
        const origin = context.req.get('origin') || '';
        const sameSite = (context.req.hostname.includes('api.sunago.app') && origin !== 'null')
            || context.req.hostname === 'localhost'
            || (!origin.includes('localhost') && origin !== 'null');
        console.log('sameSite', sameSite);

        this.sendRefreshToken(context.res, refreshTokenData, sameSite);
        const jwtString = jwt.sign({userId: user.id, roles: user.roles}, process.env.JWT_SECRET_OR_KEY as string, { expiresIn: process.env.JWT_TOKEN_EXPIRATION, algorithm: 'HS256' });
        // this.setJWTCookie(context.res, jwtString);
        const login = new Login();
        login.token = jwtString;
        if (context.req.header('sunago-source') === 'ios-mobile-app') {
            login.refreshToken = refreshTokenData.refreshToken;
            login.refreshTokenExpiry = moment(refreshTokenData.expiry).toISOString();
        }
        login.expires = moment().add(15, 'minutes').toDate(); // TODO: fix this by using the env variable
        login.userId = user._id.toString();
        login.privateKey = user.privateKey;
        login.state = user.state;
        return login;
    }

    @Mutation(() => Login)
    public async refreshToken(@Ctx() context: Context) {
        const { refreshToken } = context.req.cookies?.refreshToken
            ? context.req.cookies
            : {refreshToken: context.req.header('sunago-refresh-token')};
        if (!refreshToken) {
            throw new Error('No refresh token');
        }
        const hashRefreshToken = crypto.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY as string, 10000, 512, 'sha512').toString('hex');

        const foundUser = await UserModel
            .findOne({refreshTokens: {$elemMatch: {hash: hashRefreshToken, expiry: {$gt: moment().toDate()}}}})
            .select('refreshTokens salt hash roles privateKey state');
        if (!foundUser) throw new Error('Invalid refresh token');
        const refreshTokenData = foundUser.generateRefreshToken();
        await foundUser.save();
        const origin = context.req.get('origin') || '';
        const sameSite = (context.req.hostname.includes('api.sunago.app') && origin !== 'null')
            || context.req.hostname === 'localhost'
            || (!origin.includes('localhost') && origin !== 'null');
        console.log('sameSite', sameSite);
        this.sendRefreshToken(context.res, refreshTokenData, sameSite);
        const jwtString = jwt.sign({userId: foundUser.id, roles: foundUser.roles}, process.env.JWT_SECRET_OR_KEY as string, { expiresIn: process.env.JWT_TOKEN_EXPIRATION, algorithm: 'HS256'});
        // this.setJWTCookie(context.res, jwtString);
        const login = new Login();
        login.token = jwtString;
        if (context.req.header('sunago-source') === 'ios-mobile-app') {
            login.refreshToken = refreshTokenData.refreshToken;
            login.refreshTokenExpiry = moment(refreshTokenData.expiry).toISOString();
        }
        login.expires = moment().add(15, 'minutes').toDate(); // TODO: fix this by using the env variable
        login.userId = foundUser._id.toString();
        login.privateKey = foundUser.privateKey;
        login.state = foundUser.state;
        return login;
    }

    private sendRefreshToken(res: Response, refreshTokenData: RefreshTokenData, sameSite = true) {
        res.cookie('refreshToken', refreshTokenData.refreshToken, {
            path: '/graphql',
            httpOnly: true,
            expires: moment(refreshTokenData.expiry).add(1, 'hour').toDate(),
            domain: undefined,
            //domain: 'localhost',
            secure: !sameSite,
            sameSite: sameSite || 'none'
        });
    }

    @Mutation(() => Boolean)
    public async logout(@Ctx() context: Context) {
        const { refreshToken } = context.req.cookies;
        // delete the refreshToken from db
        if (refreshToken) {
            const hashRefreshToken = crypto.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY as string, 10000, 512, 'sha512').toString('hex');
            const foundUser = await UserModel
                .findOne({refreshTokens: {$elemMatch: {hash: hashRefreshToken, expiry: {$gt: moment().toDate()}}}})
                .select('refreshTokens');
            if (foundUser) {
                const rt = foundUser.refreshTokens.find((rf => rf.hash === hashRefreshToken));
                if (rt) {
                    const index = foundUser.refreshTokens.indexOf(rt);
                    foundUser.refreshTokens.splice(index, 1);
                    await foundUser.save();
                }
            }
        }
        // clear the refreshToken coookie
        this.sendRefreshToken(context.res, {refreshToken: '', hash: '', expiry: new Date()});
        return true;
    }
}


export const customAuthChecker: AuthChecker<Context> =
    ({ root, args, context, info }, roles) => {
    // here we can read the user from context
    // and check his permission in the db against the `roles` argument
    // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]

    if (!context.user) {
        return false;
    }

    if (root && root._id && root._id.toString() === context.user.userId) {
        context.user.roles.push('me');
    }

    if (roles.some(r=> context.user.roles.includes(r))) {
        return true;
    }

    return false; // or false if access is denied
};
