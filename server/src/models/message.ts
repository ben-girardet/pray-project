import { lrangeAsync, lpushAsync, client } from './../core/redis';
import { User } from "./user";
import { Topic } from './topic';
import { Message as IMessage } from "shared/types/message";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass, DocumentType } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { identity } from './middleware/identity';

@ObjectType()
export class Message implements IMessage {

    @Field(() => String)
    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    public _id: mongoose.Types.ObjectId;

    @Field(() => String)
    @prop()
    public text: string;

    @Field(() => String, {nullable: true})
    @prop({default: false})
    public deleted: boolean = false;

    @Field(() => Topic)
    @prop({ref: () => Topic, index: true})
    public topicId?: Ref<Topic>;

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

    public static async findTopicMessagesWithCache(topicId: any) {
      if (!topicId) {
        return [];
      }
      const cacheValue = await lrangeAsync(`topic-messages:${topicId.toString()}`, 0, -1);
      if (cacheValue && cacheValue.length) {
        return cacheValue.map(v => JSON.parse(v));
      }
      const messages = await MessageModel.find({topicId});
      const values = messages.map(m => m.toObject());
      if (!values.length) {
        return values;
      }
      for (const value of values) {
        await lpushAsync(`topic-messages:${topicId.toString()}`, JSON.stringify(value));
      }
      // TODO: del key when creating new topic messages (or add it to then list)
      // client.expire(`topic-messages:${topicId.toString()}`, 5);
      return values;
    }

}

const MessageModel = getModelForClass(Message, {schemaOptions: {timestamps: true}});
MessageModel.schema.pre('save', identity);
export { MessageModel };
