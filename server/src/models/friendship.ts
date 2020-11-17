import { Length, IsNotEmpty, validateOrReject, MaxLength } from "class-validator";
import { Topic } from './topic';
import { Friendship as IFriendship } from "shared/types/friendship";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { User } from "./user";

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

    // https://typegoose.github.io/typegoose/docs/guides/advanced/reference-other-classes#common-problems
    @prop({ref: () => 'User'})
    public user1: Ref<User>;;

    // https://typegoose.github.io/typegoose/docs/guides/advanced/reference-other-classes#common-problems
    @prop({ref: () => 'User'})
    public user2: Ref<User>;;

    // https://typegoose.github.io/typegoose/docs/guides/advanced/reference-other-classes#common-problems
    @prop({ref: () => 'User'})
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
