import { Length, IsNotEmpty, validateOrReject, MaxLength } from "class-validator";
import { User } from "./user";
import { Topic } from './topic';
import { Prayer as IPrayer } from "shared/types/prayer";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass, DocumentType } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { identity } from './middleware/identity';

@ObjectType()
export class Prayer implements IPrayer {

    @Field(() => String)
    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    public _id: mongoose.Types.ObjectId;

    @Field(() => String)
    @prop({ref: () => Topic})
    public topicId: Ref<Topic>;

    @prop({ref: () => User})
    public createdBy?: Ref<User>;

    @prop({ref: () => User})
    public updatedBy?: Ref<User>;

    @Field(() => Date)
    @prop()
    public createdAt: Date;

    @Field(() => Date)
    @prop()
    public updatedAt: Date;

}

const PrayerModel = getModelForClass(Prayer, {schemaOptions: {timestamps: true}});
PrayerModel.schema.pre('save', identity);
export { PrayerModel };
