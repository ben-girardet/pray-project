import { Length, IsNotEmpty, validateOrReject, MaxLength } from "class-validator";
import { User } from "./user";
import { Topic } from './topic';
import { Friendship as IFriendship } from "shared/types/friendship";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass, DocumentType } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { identity } from './middleware/identity';

@ObjectType()
export class Friendship implements IFriendship {

    @Field(() => String)
    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    public _id: mongoose.Types.ObjectId;

    @Field(() => String)
    @prop()
    public text: string;

    @prop({ref: () => User})
    public user1: Ref<User>;;

    @prop({ref: () => User})
    public user2: Ref<User>;;

    @prop({ref: () => User})
    public requestedBy: Ref<User>;;

    @Field()
    @prop()
    status: 'requested' | 'accepted' | 'declined' | 'removed';

    @Field(() => Date)
    @prop()
    requestedAt: Date;

    @Field(() => Date)
    @prop()
    respondedAt?: Date;

    @Field(() => Date)
    @prop()
    removedAt?: Date;

}

const FriendshipModel = getModelForClass(Friendship, {schemaOptions: {timestamps: false}});
// FriendshipModel.schema.pre('save', identity);
export { FriendshipModel };
