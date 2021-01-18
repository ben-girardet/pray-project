import { User, UserModel } from "../models/user";
import { Token, TokenModel } from "../models/token";
import { Resolver, Mutation, Query, Arg } from "type-graphql";
import { RegisterInput, ValidateRegistrationInput } from './inputs/registration';
import SMSAPI from 'smsapicom';
import Gun from 'gun';
import 'gun/sea';

export interface SeaPair {
    priv: string;
    pub: string;
    epriv: string;
    epub: string;
}

@Resolver()
export class RegistrationResolver {

    @Query(() => Boolean)
    public async exists(@Arg('username') username: string) {
        const existingUser = await UserModel.findOne({$or: [{email: username, emailValidated: true}, {mobile: username, mobileValidated: true}]});
        return existingUser !== null;
    }

    @Mutation(() => Token)
    public async register(@Arg('data') data: RegisterInput) {
        if (!data.mobile) {
            throw new Error('Registration requires a mobile');
        }
        if (data.mobile.substr(0, 1) !== '+') {
            throw new Error('Mobile must be sent in internation format starting with a plus sign');
        }
        if (!data.mobile && !data.email) {
            throw new Error('Either email or mobile must be provided');
        }
        const smsapi = new SMSAPI({ oauth: {
            accessToken: process.env.SMSAPI_TOKEN
        }});
        const existingUser = await UserModel.findOne({$or: [{email: data.email, emailValidated: true}, {mobile: data.mobile, mobileValidated: true}]});
        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new Error('This email is already taken');
            }
            if (existingUser.mobile === data.mobile) {
                throw new Error('This mobile is already taken');
            }
        }
        const token = new TokenModel();
        token.setToken();
        token.data = data;

        const isTestAccount = data.mobile.substr(0, 8) === '+4170000';
        if (isTestAccount) {
            token.code = process.env.TEST_CODE || '001122';
        }

        const response = await token.save();

        if (!isTestAccount) {
            await smsapi.message
                .sms()
                //.from(app.name)
                .from('Info')
                .to(data.mobile)
                .message('Sunago registration code: ' + token.code)
                .execute(); // return Promise
        }
        return response.toObject();
    }

    @Mutation(() => User)
    public async validateRegistration(@Arg('data') data: ValidateRegistrationInput) {
        if (data.type !== 'email' && data.type !== 'mobile') {
            throw new Error('Type must be either "email" or "mobile"');
        }
        const token = await TokenModel.findValid(data.token, data.code);
        if (data.type === 'email' && !token.data.email) {
            throw new Error('Token email is empty');
        }
        if (data.type === 'mobile' && !token.data.mobile) {
            throw new Error('Token mobile is empty');
        }
        const existingUser = await UserModel.findOne({$or: [{email: token.data.email, emailValidated: true}, {mobile: token.data.mobile, mobileValidated: true}]});
        if (existingUser) {
            if (existingUser.email === token.data.email) {
                throw new Error('This email is already taken');
            }
            if (existingUser.mobile === token.data.mobile) {
                throw new Error('This mobile is already taken');
            }
        }
        const newUser = new UserModel();
        newUser.firstname = token.data.firstname || '';
        newUser.lastname = token.data.lastname || '';
        newUser.email = token.data.email;
        newUser.mobile = token.data.mobile;
        newUser.roles = ['user'];
        const isTestAccount = token.data.mobile.substr(0, 8) === '+4170000';
        if (isTestAccount) {
            data.password = process.env.TEST_PASSWORD || 'this-must-be-set-by-env-variable';
        }
        newUser.hashPassword(data.password);
        const pair = await this.generatePair();
        newUser.privateKey = pair.epriv;
        newUser.publicKey = pair.epub;
        newUser.state = 0;
        if (data.type === 'email') {
            newUser.emailValidated = true;
        }
        if (data.type === 'mobile') {
            newUser.mobileValidated = true;
        }

        const createdUser = await newUser.save();
        token.used = true;
        await token.save();
        return createdUser.toObject();
    }

    @Mutation(() => Token)
    public async forgotPassword(@Arg('username') username: string) {
        const user = await UserModel.findOne({$or: [
            {email: username},
            {mobile: username}
        ]});
        if (!user) {
            throw new Error('User not found');
        }
        const token = new TokenModel();
        token.setToken();
        token.data = username;
        const response = await token.save();
        return response.toObject();
    }

    @Mutation(() => User)
    public async resetPassword(@Arg('token') tokenString: string, @Arg('code') code: string, @Arg('password') password: string) {
        const token = await TokenModel.findValid(tokenString, code);
        if (!token.data.username) {
            throw new Error('Token is missing username');
        }
        const user = await UserModel.findOne({$or: [
            {email: token.data.username},
            {mobile: token.data.username}
        ]});
        if (!user) {
            throw new Error('User not found');
        }

        user.hashPassword(password);
        const response = await user.save();
        return response.toObject();
    }

    private async generatePair(): Promise<SeaPair> {
        const SEA = Gun.SEA;
        return new Promise((resolve) => {
        SEA.pair((pair) => {
            resolve(pair as unknown as SeaPair);
        });
        });
    }

}
