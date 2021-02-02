import { saveModelItems, getModelItems } from './../core/redis';
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

    @Field(() => String)
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

    // @prop({type: () => [String], _id: false, index: true})
    // public viewedBy?: string[] = [];

    public static async findTopicMessagesWithCache(topicId: any) {
      if (!topicId) {
        return [];
      }
      const cacheValues = await getModelItems(`topic-messages:${topicId.toString()}`);
        if (cacheValues && cacheValues.length) {
            return cacheValues.map((m) => {
                return new MessageModel(m).toObject();
            });
        }
      const messages = await MessageModel.find({topicId});
      const values = messages.map(m => m.toObject());
      if (!values.length) {
        return values;
      }
      saveModelItems(`topic-messages:${topicId.toString()}`, values);
      return values;
    }

}

const MessageModel = getModelForClass(Message, {schemaOptions: {timestamps: true}});
MessageModel.schema.pre('save', identity);
export { MessageModel };
