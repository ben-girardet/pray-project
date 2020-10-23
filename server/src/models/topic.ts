import { Length, IsNotEmpty, validateOrReject, MaxLength } from "class-validator";
import { Topic as ITopic } from "shared/types/topic";
import { User } from "./user";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass, DocumentType } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { identity } from './middleware/identity';
import { Share } from './share';
import { Image } from './image';

@ObjectType()
export class Topic implements ITopic {

    @Field(() => String)
    public get id(): string {
        return this._id ? this._id.toString() : '';
    };

    // @prop()
    public _id: mongoose.Types.ObjectId;

    @Field(() => String)
    @prop()
    name: string;

    @Field(() => String)
    @prop()
    description?: string;

    @Field(type => [Image], {nullable: true})
    @prop({type: () => [Image]})
    image?: Image[];

    @Field(() => String)
    @prop()
    color: string;

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

    @Field(type => [Share])
    @prop({type: () => [Share]})
    public shares: Share[];

    @Field({nullable: true})
    public myShare?: Share;

    public setMyShare(userId: mongoose.Types.ObjectId) {
        this.myShare = undefined;
        for (const share of this.shares) {
            if (share.userId.equals(userId)) {
                this.myShare = share;
                return;
            }
        }
    }

    public toObjectWithMyShare() {
        const instance: any = this;
        if (!instance.toObject) {
            throw new Error('Missing toObject()');
        }
        const obj = instance.toObject();
        obj.myShare = instance.myShare;
        return obj;
    }
}

const TopicModel = getModelForClass(Topic, {schemaOptions: {timestamps: true}});
TopicModel.schema.pre('save', identity);
export { TopicModel };
