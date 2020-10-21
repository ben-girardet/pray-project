import { Length, IsNotEmpty, validateOrReject, MaxLength } from "class-validator";
import { User } from "./user";
import { Message as IMessage } from "shared/types/message";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass, DocumentType } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { identity } from './middleware/identity';

@ObjectType()
export class Message implements IMessage {

    @Field(() => String)
    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    @prop()
    public _id: mongoose.Types.ObjectId;

    @Field(() => String)
    @prop()
    public text: string;

    @Field(() => User)
    @prop({ref: () => User})
    public createdBy?: Ref<User>;

    @Field(() => User)
    @prop({ref: () => User})
    public updatedBy?: Ref<User>;

    @Field(() => Date)
    @prop()
    public createdAt: Date;

    @Field(() => Date)
    @prop()
    public updatedAt: Date;

}

const MessageModel = getModelForClass(Message, {schemaOptions: {timestamps: true}});
MessageModel.schema.pre('save', identity);
export { MessageModel };
