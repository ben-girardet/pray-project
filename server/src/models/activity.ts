import { User } from "./user";
import { Topic, TopicModel } from './topic';
import { Message } from './message';
import { Prayer } from './prayer';
import { Activity as IActivity, ActivityAction } from "shared/types/activity";
import { ObjectType, Field } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { saveModelItems, getModelItems, delAsync } from './../core/redis';

@ObjectType()
export class Activity implements IActivity {

    @Field(() => String)
    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    public _id: mongoose.Types.ObjectId;

    // @Field(() => String)
    @prop({ref: () => User, index: true})
    public user: Ref<User>;

    @Field(() => String)
    public get userId(): string {
        return this.user ? this.user.toString() : '';
    }

    // @Field(() => String)
    @prop({ref: () => Topic, index: true})
    public topic: Ref<Topic>;

    @Field(() => String, {nullable: true})
    public get topicId(): string | null {
        return this.topic ? this.topic.toString() : null;
    }

    // @Field(() => String)
    @prop({ref: () => Message, index: true})
    public message: Ref<Message>;

    @Field(() => String, {nullable: true})
    public get messageId(): string | null {
        return this.message ? this.message.toString() : null;
    }

    @Field(() => String, {nullable: true})
    @prop({ref: () => Prayer, index: true})
    public prayer: Ref<Prayer>;

    @Field(() => String, {nullable: true})
    public get prayerId(): string | null {
        return this.prayer ? this.prayer.toString() : null;
    }

    @Field(() => String)
    @prop({type: String})
    public action: ActivityAction;

    @Field(() => Date)
    @prop({index: true})
    public date: Date;

    // @Field(() => String)
    @prop({ref: () => User, index: true})
    public user2: Ref<User>;

    @Field(() => String, {nullable: true})
    public get userId2(): string {
        return this.user2 ? this.user2.toString() : '';
    }

    @Field(() => String, {nullable: true})
    @prop()
    public data?: string;

    public static async topic(userId: mongoose.Types.ObjectId, topicId: mongoose.Types.ObjectId, action: 'create' | 'edit:name' | 'delete', data?: string) {
        const newActivity = new ActivityModel();
        newActivity.user = userId;
        newActivity.topic = topicId
        newActivity.action = 'topic:' + action as ActivityAction;
        newActivity.date = new Date();
        newActivity.data = data;
        await newActivity.save();
        await ActivityModel.clearActivityCacheRelatedToTopic(topicId);
    }

    public static async topicStatus(userId: mongoose.Types.ObjectId, topicId: mongoose.Types.ObjectId, status: 'answered' | 'archived' | 'active') {
        const newActivity = new ActivityModel();
        newActivity.user = userId;
        newActivity.topic = topicId
        newActivity.action = 'topic:setStatus:' + status as ActivityAction;
        newActivity.date = new Date();
        await newActivity.save();
        await ActivityModel.clearActivityCacheRelatedToTopic(topicId);
    }

    public static async topicShare(userId: mongoose.Types.ObjectId, topicId: mongoose.Types.ObjectId, action: 'add' | 'remove', userId2: mongoose.Types.ObjectId) {
        const newActivity = new ActivityModel();
        newActivity.user = userId;
        newActivity.topic = topicId
        newActivity.action = 'topic:share:' + action as ActivityAction;
        newActivity.date = new Date();
        newActivity.user2 = userId2;
        await newActivity.save();
        await ActivityModel.clearActivityCacheRelatedToTopic(topicId);
    }

    public static async prayed(userId: mongoose.Types.ObjectId, topicId: mongoose.Types.ObjectId, prayerId: mongoose.Types.ObjectId) {
        const newActivity = new ActivityModel();
        newActivity.user = userId;
        newActivity.topic = topicId
        newActivity.prayer = prayerId;
        newActivity.action = 'prayed';
        newActivity.date = new Date();
        await newActivity.save();
        await ActivityModel.clearActivityCacheRelatedToTopic(topicId);
    }

    public static async message(userId: mongoose.Types.ObjectId, topicId: mongoose.Types.ObjectId, messageId: mongoose.Types.ObjectId, action: 'create' | 'edit' | 'delete') {
        const newActivity = new ActivityModel();
        newActivity.user = userId;
        newActivity.topic = topicId
        newActivity.message = messageId;
        newActivity.action = 'message:' + action as ActivityAction;
        newActivity.date = new Date();
        await newActivity.save();
        await ActivityModel.clearActivityCacheRelatedToTopic(topicId);
    }

    public static async findUserActivitiesWithCache(userId: any) {
        if (!userId) {
          return [];
        }
        const cacheValues = await getModelItems(`user-activities:${userId.toString()}`);
        if (false && cacheValues && cacheValues.length) {
          return cacheValues.map((p) => {
              return new ActivityModel(p).toObject();
          });
        }
        const topics = await TopicModel.find({"shares.userId": userId}).select('_id');
        const activities = await ActivityModel.find({topic: {$in: topics.map(t => t._id)}}, null, {sort: {date: -1}});
        const values = activities.map(m => m.toObject());
        if (!values.length) {
          return values;
        }
        saveModelItems(`user-activities:${userId.toString()}`, values);
        return values;
      }

    public static async clearActivityCacheRelatedToTopic(topicId: mongoose.Types.ObjectId) {
        const topic = await TopicModel.findOne({_id: topicId}).select('shares');
        if (!topic) {
            return;
        }
        const userIds: mongoose.Types.ObjectId[] = topic.shares.map(s => s.userId);
        for (const userId of userIds) {
            await delAsync(`user-activities:${userId.toString()}`);
        }
    }

}

const ActivityModel = getModelForClass(Activity, {schemaOptions: {timestamps: false}});
// ActivityModel.schema.pre('save', identity);
export { ActivityModel };
