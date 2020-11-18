import { Length, IsNotEmpty, validateOrReject, MaxLength } from "class-validator";
import { Topic } from './topic';
import { Friendship as IFriendship } from "shared/types/friendship";
import { ObjectType, Field, Ctx } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { User, UserModel } from "./user";
import { Context } from '../resolvers/context-interface';

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

    @Field(() => User, {nullable: true})
    public async friend(@Ctx() context: Context) {
        const user1String = this.user1?.toString();
        let user: any;
        if (user1String === context.user.userId) {
            user = await UserModel.findById(this.user2);
        } else {
            user = await UserModel.findById(this.user1);
        }
        return user ? user.toObject() : undefined;
    }

}

const FriendshipModel = getModelForClass(Friendship, {schemaOptions: {timestamps: false}});
export { FriendshipModel };
