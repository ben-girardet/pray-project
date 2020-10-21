import express from 'express';
import passport from 'passport';
import { promisify } from 'util';
import crypto from 'crypto';

import {
    createRefreshToken,
    createToken,
    decodeRefreshToken,
    decodeToken,
} from '../core/jwt';
import { delAsync, getAsync, setAsync } from '../core/redis';
import { User } from '../models/user';
import { send } from '../core/mail';
import { config, RoleType } from '../core/config';
import passwordResetTemplate from '../templates/mail/password-reset';
import passwordChangedTemplate from '../templates/mail/password-changed';
import confirmEmailTemplate from '../templates/mail/email-confirmed';
import { Auth, Controller, Get, Post } from '../core/framework';
import { FacebookProvider } from '../core/auth-providers/facebook';

import { TokenUserPayload } from 'shared/types/user';

@Controller('/api/auth')
export class AuthController {
    @Post('/login')
    async login(req: express.Request, res: express.Response, next: express.NextFunction) {
        passport.authenticate(
            'login',
            { session: false },
            (err, user, info) => {
                if (err) {
                    return next(err);
                }

                if (!user) {
                    return res.status(401).json(info);
                }

                req.login(user, { session: false }, async (err) => {
                    if (err) {
                        return res.send(err);
                    }

                    try {
                        // TODO: fix this get user
                        // const fetchedUser = await userRepository.findOneOrFail({
                        //     where: { id: user.id },
                        // });
                        const fetchedUser: any = 0;
                        const roles = fetchedUser.roles.reduce((arr, role) => {
                            arr.push(role.name as RoleType);
                            return arr;
                        }, [] as RoleType[]);

                        const body = {
                            sub: user.id,
                            iat: Math.floor(Date.now() / 1000),
                            email: user.email,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            picture: null,
                            claims: roles,
                        } as TokenUserPayload;
                        const token = createToken(body);
                        const refreshToken = createRefreshToken(body);

                        const response = {
                            token,
                            refreshToken,
                        };

                        // Store refresh token and token in Redis
                        await setAsync(user.id, JSON.stringify(response));

                        return res.status(200).json(response);
                    } catch (error) {
                        return res.status(400).send(error);
                    }
                });
            }
        )(req, res, next);
    }

    @Post('/logout')
    async logout(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const token = decodeToken(req.body.token);

            await delAsync(token.sub);
        } catch (e) {
        } finally {
            return res.status(200).json({ logout: true });
        }
    }

    @Post('/token')
    async token(req: express.Request, res: express.Response, next: express.NextFunction) {
        const body = req.body;

        const decoded = decodeRefreshToken(body.refreshToken);

        if (decoded) {
            const userId = decoded.sub;
            const storedTokens = JSON.parse(await getAsync(userId));

            if (storedTokens) {
                const refreshToken = createRefreshToken({
                    sub: userId,
                    iat: Math.floor(Date.now() / 1000),
                    firstName: decoded.firstName,
                    lastName: decoded.lastName,
                    email: decoded.email,
                    claims: decoded.claims,
                    picture: decoded.picture
                });
                const token = createToken({
                    sub: userId,
                    iat: Math.floor(Date.now() / 1000),
                    firstName: decoded.firstName,
                    lastName: decoded.lastName,
                    email: decoded.email,
                    claims: decoded.claims,
                    picture: decoded.picture
                });

                const response = {
                    token,
                    refreshToken,
                };

                await setAsync(userId, JSON.stringify(response));

                res.status(200).json(response);
            }
        } else {
            res.status(404).send('Invalid request');
        }
    }

    @Auth('register')
    @Post('/register')
    async register(req: express.Request, res: express.Response, next: express.NextFunction) {
        return res.status(200).json(req.user);
    }

    @Auth('jwt')
    @Get('/user')
    async currentUser(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send(req.user);
    }

    @Post('/forgot')
    async forgotPassword(req: express.Request, res: express.Response, next: express.NextFunction) {
        const token = (await promisify(crypto.randomBytes)(20)).toString('hex');
        const email = req.body.email;

        try {
            // TODO: fix this get user thing
            // const user = await userRepository.findOneOrFail({ email });
            const user: any = 0;

            if (user) {
                const resetPasswordExpires = Date.now() + 3600000;

                // TODO: Fix this update thing
                // await userRepository.update(
                //     { id: user.id },
                //     { token, tokenExpires: resetPasswordExpires }
                // );

                if (config.ENABLE_MAIL) {
                    await send(
                        config.NO_REPLY_EMAIL,
                        user.email,
                        config.FORGOT_PASSWORD_EMAIL_SUBJECT,
                        passwordResetTemplate(
                            `${config.PASSWORD_RESET_URL}${token}`
                        )
                    );
                }

                return res.status(200).send('Password reset succesful.');
            }
        } catch (e) {
            return res
                .status(404)
                .send('There was an error resetting your password');
        }
    }

    @Post('/reset/:token')
    async resetPassword(req: express.Request, res: express.Response, next: express.NextFunction) {
        // TODO: Fix this data thing
        // const user = await userRepository.findOneOrFail({
        //     token: req.params.token,
        //     tokenExpires: MoreThan(Date.now()),
        // });
        const user: any = 0;

        if (user && !user.emailValidated) {
            return res.status(400).send('Email must be confirmed first');
        }

        if (!user) {
            return res
                .status(400)
                .send('Password reset token is invalid or expired');
        }

        try {
            const userObj = new User();
            userObj.hashPassword(req.body.password);
            // userObj.token = '';
            // userObj.tokenExpires = -1;

            // TODO: fix this data thing
            // await userRepository.update({ id: user.id }, userObj);

            if (config.ENABLE_MAIL) {
                await send(
                    config.NO_REPLY_EMAIL,
                    user.email,
                    config.PASSWORD_RESET_EMAIL_SUBJECT,
                    passwordChangedTemplate(user.email)
                );
            }

            res.status(200).send('Password change successful');
        } catch (error) {
            res.status(404).send('There was an error changing your password.');
        }
    }

    @Post('/confirm-email/:token')
    async confirmEmail(req: express.Request, res: express.Response, next: express.NextFunction) {
        // TODO: Fix this data thing
        // const user = await userRepository.findOneOrFail({
        //     token: req.params.token,
        //     email_verified: false,
        //     tokenExpires: MoreThan(Date.now()),
        // });
        const user: any = 0;

        if (!user) {
            return res
                .status(400)
                .send('Email confirmation token is invalid or expired');
        }

        try {
            const userObj = new User();
            userObj.emailValidated = true;
            // userObj.token = '';
            // userObj.tokenExpires = -1;

            // TODO: fix this update thing
            // await userRepository.update({ id: user.id }, userObj);

            if (config.ENABLE_MAIL) {
                await send(
                    config.NO_REPLY_EMAIL,
                    user.email,
                    config.EMAIL_CONFIRMED_EMAIL_SUBJECT,
                    confirmEmailTemplate(user.email)
                );
            }

            res.status(200).send('Email address confirmed');
        } catch (error) {
            res.status(404).send('There was an error confirming your email.');
        }
    }

    @Get('/facebook/verify')
    async getFacebookToken(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const { user, roles } = await FacebookProvider(req);

            const payload = {
                sub: user.id,
                iat: Math.floor(Date.now() / 1000),
                picture: user.picture.data.url,
                firstName: user.name.split(' ')[0] ?? '',
                lastName: user.name.split(' ')[1] ?? '',
                email: user.email,
                provider: 'facebook',
                claims: roles,
            };
            const token = createToken(payload);
            const refreshToken = createRefreshToken(payload);

            await setAsync(user.id, JSON.stringify({ token, refreshToken }));

            res.json({ token, refreshToken });
        } catch (err) {
            console.log(err);
            res.status(400).send('error');
        }
    }

}
