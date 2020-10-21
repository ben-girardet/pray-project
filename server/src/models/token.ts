import { Length, IsNotEmpty, validateOrReject, MaxLength } from "class-validator";
import crypto from 'crypto';
import { Token as IToken } from "shared/types/token";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass, DocumentType } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import moment from 'moment';
import { config } from '../core/config';

@ObjectType()
export class Token implements IToken {

    @Field(() => String)
    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    @prop()
    public _id: mongoose.Types.ObjectId;

    @Field(() => String)
    @prop()
    public token: string;

    @Field(() => String)
    @prop()
    public code: string;

    @prop({nullable: true, select: true})
    public data: any;

    @Field(() => Date)
    @prop()
    public expires: Date;

    @prop()
    public used: boolean;

    public setToken() {
        this.token = crypto.randomBytes(16).toString('hex');
        this.code = config.TEST_MODE ? '001122': Math.floor(100000 + Math.random() * 900000).toString();
        this.expires = moment().add(24, 'hours').toDate();
    }

    public static async findValid(tokenString: string, code: string): Promise<DocumentType<Token>> {
        const token = await TokenModel.findOne({token: tokenString, code});
        if (!token) {
            throw new Error('Token not found');
        }
        if (token.used) {
            throw new Error('Token was already used');
        }
        if (moment(token.expires).isBefore(moment())) {
            throw new Error('Token has expired');
        }
        return token;
    }

}

const TokenModel = getModelForClass(Token, {schemaOptions: {timestamps: true}});

export { TokenModel };
