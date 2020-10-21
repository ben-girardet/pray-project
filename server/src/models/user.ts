import { Length, IsNotEmpty, validateOrReject, MaxLength } from "class-validator";
import crypto from 'crypto';
import { User as IUser } from "shared/types/user";
import { ObjectType, Field, Authorized } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import { config, RoleType } from '../core/config';
import moment from 'moment';

export interface RefreshTokenData {
    refreshToken: string;
    hash: string;
    expiry: Date
}

export class RefreshToken {
    @prop()
    hash: string;

    @prop()
    expiry: Date;
}

@ObjectType()
export class User implements IUser {

    @Field(() => String)
    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    @Field(() => String)
    @prop()
    public firstname: string;

    @Field(() => String)
    @prop()
    public lastname: string;

    @Authorized(['me'])
    @Field(() => String)
    @prop()
    public email: string;

    @prop()
    public emailValidated?: boolean;

    @Authorized(['me'])
    @Field(() => String)
    @prop()
    public mobile: string;

    @prop()
    public mobileValidated?: boolean;

    @prop()
    public hash: string;

    @prop()
    public salt: string;

    @Field(() => String, {nullable: true})
    @prop()
    public publicKey: string;

    @Authorized(['me'])
    @prop()
    public privateKey: string;

    @prop()
    public facebookId?: string;

    @prop()
    public lastLogin?: Date;

    @Field(() => String, {nullable: false})
    @prop({type: () => [String]})
    public roles: RoleType[];

    @prop({type: () => [RefreshToken], _id: false})
    public refreshTokens: RefreshToken[];

    public hashPassword(password: string) {
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    }

    public isPasswordValid(password: string): boolean {
        const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
        return this.hash === hash;
    }

    public generateRefreshToken(): RefreshTokenData {
        const refreshToken = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY as string, 10000, 512, 'sha512').toString('hex');
        const expiry = moment().add(process.env.JWT_REFRESH_TOKEN_EXPIRATION, 'days').toDate();
        this.refreshTokens.push({
            hash,
            expiry
        });
        return { refreshToken, hash, expiry };
    }

    // TODO: should we do this with mongoose middleware
    // @BeforeInsert()
    // @BeforeUpdate()
    // validate(): Promise<void> {
    //     return validateOrReject(this);
    // }
}

const UserModel = getModelForClass(User, {schemaOptions: {timestamps: true}});

export { UserModel };
