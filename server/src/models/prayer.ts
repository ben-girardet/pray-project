import { User } from "./user";
import { Topic } from './topic';
import { Prayer as IPrayer } from "shared/types/prayer";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { identity } from './middleware/identity';
import { lrangeAsync, lpushAsync, client } from './../core/redis';

@ObjectType()
export class Prayer implements IPrayer {

    @Field(() => String)
    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    public _id: mongoose.Types.ObjectId;

    @Field(() => String)
    @prop({ref: () => Topic, index: true})
    public topicId: Ref<Topic>;

    @prop({ref: () => User, index: true})
    public createdBy?: Ref<User>;

    @prop({ref: () => User})
    public updatedBy?: Ref<User>;

    @Field(() => Date)
    @prop({index: true})
    public createdAt: Date;

    @Field(() => Date)
    @prop()
    public updatedAt: Date;

    public static async findTopicPrayersWithCache(topicId: any) {
        if (!topicId) {
          return [];
        }
        const cacheValue = await lrangeAsync(`topic-prayers:${topicId.toString()}`, 0, -1);
        if (cacheValue && cacheValue.length) {
          // return cacheValue.map(v => JSON.parse(v));
        }
        const prayers = await PrayerModel.find({topicId});
        const values = prayers.map(m => m.toObject());
        if (!values.length) {
          return values;
        }
        for (const value of values) {
          await lpushAsync(`topic-prayers:${topicId.toString()}`, JSON.stringify(value));
        }
        // TODO: del key when creating new topic prayer (or add it to then list)
        // client.expire(`topic-prayers:${topicId.toString()}`, 5);
        return values;
      }

}

const PrayerModel = getModelForClass(Prayer, {schemaOptions: {timestamps: true}});
PrayerModel.schema.pre('save', identity);
export { PrayerModel };
