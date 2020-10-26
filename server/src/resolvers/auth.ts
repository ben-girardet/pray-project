import { Response } from 'express';
import { RefreshTokenData, User, UserModel } from "../models/user";
import { Token, TokenModel } from "../models/token";
import { Resolver, Mutation, Ctx, Arg, AuthChecker } from "type-graphql";
import { RegisterInput, ValidateRegistrationInput } from './inputs/registration';
import jwt from 'jsonwebtoken';
import { Context } from './context-interface';
import crypto from 'crypto';
import moment from 'moment';


@Resolver()
export class AuthResolver {

    @Mutation(() => String)
    public async login(@Arg('username') username: string, @Arg('password') password: string, @Ctx() context: Context) {
        const user = await UserModel.findOne({$or: [{email: username, emailValidated: true}, {mobile: username, mobileValidated: true}]});
        if (!user) {
            throw new Error('User not found');
        }
        const passwordValid = user.isPasswordValid(password);
        if (!passwordValid) {
            throw new Error('Invalid password');
        }
        const refreshTokenData = user.generateRefreshToken();
        await user.save();
        this.sendRefreshToken(context.res, refreshTokenData);
        const jwtString = jwt.sign({userId: user.id, roles: user.roles}, process.env.JWT_SECRET_OR_KEY as string, { expiresIn: process.env.JWT_TOKEN_EXPIRATION, algorithm: 'HS256' });
        this.setJWTCookie(context.res, jwtString);
        return jwtString;
    }

    @Mutation(() => String)
    public async refreshToken(@Arg('userId') userId: string, @Ctx() context: Context) {
        const { refreshToken } = context.req.cookies;
        if (!refreshToken) throw new Error('No refresh token provided');
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) throw new Error('Invalid user');
        let isRefreshTokenValid = false;


        foundUser.refreshTokens = foundUser.refreshTokens.filter(
            (storedToken) => {
                const hashRefreshToken = crypto.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY as string, 10000, 512, 'sha512').toString('hex');
                const isMatch = hashRefreshToken === storedToken.hash;
                const isValid = moment(storedToken.expiry).isAfter(moment());
                if (isMatch && isValid) {
                    isRefreshTokenValid = true;
                }
                return !isMatch && isValid;
            }
        );
        if (!isRefreshTokenValid) throw new Error('Invalid refresh token');
        const refreshTokenData = foundUser.generateRefreshToken();
        await foundUser.save();
        this.sendRefreshToken(context.res, refreshTokenData);
        const jwtString = jwt.sign({userId: foundUser.id, roles: foundUser.roles}, process.env.JWT_SECRET_OR_KEY as string, { expiresIn: process.env.JWT_TOKEN_EXPIRATION, algorithm: 'HS256'});
        this.setJWTCookie(context.res, jwtString);
        return jwtString;
    }

    private setJWTCookie(res: Response, jwtString: string) {
        res.cookie('jwt', jwtString, {
            path: '/graphql',
            httpOnly: true,
            expires: moment().add(15, 'minutes').toDate(),
            domain: undefined,
            //domain: 'localhost',
            sameSite: true,
        });
    }

    private sendRefreshToken(res: Response, refreshTokenData: RefreshTokenData) {
        res.cookie('refreshToken', refreshTokenData.refreshToken, {
            path: '/graphql',
            httpOnly: true,
            expires: refreshTokenData.expiry,
            domain: undefined,
            //domain: 'localhost',
            sameSite: true,
        });
    }

    @Mutation(() => Boolean)
    public async logout(@Arg('userId') userId: string, @Ctx() context: Context) {
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
