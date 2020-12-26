import { User } from "./user";
import { Topic } from './topic';
import { Prayer as IPrayer } from "shared/types/prayer";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { identity } from './middleware/identity';
import { saveModelItems, getModelItems } from './../core/redis';

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

    @prop()
    public viewedBy?: string[] = [];

    public static async findTopicPrayersWithCache(topicId: any) {
        if (!topicId) {
          return [];
        }
        const cacheValues = await getModelItems(`topic-prayers:${topicId.toString()}`);
        if (cacheValues && cacheValues.length) {
          return cacheValues.map((p) => {
              return new PrayerModel(p).toObject();
          });
        }
        const prayers = await PrayerModel.find({topicId});
        const values = prayers.map(m => m.toObject());
        if (!values.length) {
          return values;
        }
        saveModelItems(`topic-prayers:${topicId.toString()}`, values);
        return values;
      }

}

const PrayerModel = getModelForClass(Prayer, {schemaOptions: {timestamps: true}});
PrayerModel.schema.pre('save', identity);
export { PrayerModel };
