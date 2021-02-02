import { User } from "./user";
import { ObjectType, Field, Authorized } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';

@ObjectType()
export class PushPlayer {

    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    public _id: mongoose.Types.ObjectId;

    @prop({ref: () => 'User', index: true})
    public user?: Ref<User>;

    public get userId(): string {
        return this.user ? this.user.toString() : '';
    }

    @prop({type: String})
    public regId: string;

    // TODO: I don't know if this is still necessary
    // and if yes how to set it
    @prop({type: String})
    public uuid: string;

    @prop({type: String})
    public type: 'fcm' | 'apn';

    @Authorized(['me'])
    @Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public tags: string[];

    @Authorized(['me'])
    @Field(() => Boolean)
    @prop({index: true})
    public active: boolean;

}

const PushPlayerModel = getModelForClass(PushPlayer, {schemaOptions: {timestamps: false}});
export { PushPlayerModel };
