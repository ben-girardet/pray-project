import { Topic as ITopic } from "shared/types/topic";
import { User } from "./user";
import { ObjectType, Field } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
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

    @Field(type => [Image], {nullable: true})
    @prop({type: () => [Image]})
    image?: Image[];

    @Field(() => String)
    @prop()
    color: string;

    @Field(() => String, {defaultValue: 'active'})
    @prop({default: 'active', index: true})
    status: 'active' | 'answered' | 'archived' = 'active';

    @Field(() => Date)
    @prop()
    public answeredAt?: Date;

    // @Field(() => User)
    @prop({ref: () => User, index: true})
    public createdBy?: Ref<User>;

    // @Field(() => User)
    @prop({ref: () => User})
    public updatedBy?: Ref<User>;

    @Field(() => Date)
    @prop()
    public createdAt: Date;

    @Field(() => Date)
    @prop({index: true})
    public updatedAt: Date;

    @Field(type => [Share])
    @prop({type: () => [Share], index: true})
    public shares: Share[];

    @Field({nullable: true})
    public myShare?: Share;

    @prop({type: () => [String], _id: false, index: true})
    public viewedBy?: string[] = [];

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

    public static async findOneAndCheckRole(topicId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, requireOwner = false) {
        const topic = await TopicModel.findOne({_id: topicId, shares: {$elemMatch: {userId}}});
        if (!topic) {
            throw new Error('Topic not found');
        }
        topic.setMyShare(userId);
        if (!topic.myShare || (requireOwner && topic.myShare.role !== 'owner')) {
            throw new Error('Access denied');
        }
        return topic;
    }

    public addShare(userId: mongoose.Types.ObjectId, encryptedBy: mongoose.Types.ObjectId, encryptedContentKey: string, owner = false) {
        const existingShare = this.shares.find(share => share.userId.equals(userId));
        if (existingShare) {
            existingShare.encryptedContentKey = encryptedContentKey;
            existingShare.role = owner ? 'owner' : 'member';
        } else {
            this.shares.push({
                userId,
                encryptedBy,
                encryptedContentKey,
                role: owner ? 'owner' : 'member'
            });
        }
    }

    public removeShare(userId: mongoose.Types.ObjectId) {
        for (let index = 0; index < this.shares.length; index++) {
            const share = this.shares[index];
            if (share.userId.equals(userId)) {
                this.shares.splice(index, 1);
                return;
            }
        }
        const indexOfViewedBy = (this.viewedBy || []).indexOf(userId.toString());
        if (indexOfViewedBy !== -1) {
            this.viewedBy = this.viewedBy?.splice(indexOfViewedBy, 1);
        }
        return;
    }
}

const TopicModel = getModelForClass(Topic, {schemaOptions: {timestamps: true}});
TopicModel.schema.pre('save', identity);
export { TopicModel };
