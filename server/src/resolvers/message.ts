import { CreateMessageInTopicInput, EditMessageInput } from './inputs/message';
import { Topic, TopicModel } from "../models/topic";
import { Message, MessageModel } from "../models/message";
import { User, UserModel } from "../models/user";
import { Share } from "../models/share";
import { Resolver, Query, Arg, Authorized, Ctx, Mutation } from "type-graphql";
import { FilterQuery } from 'mongoose';
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";

@Resolver()
export class MessageResolver {

//   @Authorized(['user'])
//   @Query(() => [Message])
//   public async messages(@Ctx() context: Context) {
//     const userId = new mongoose.Types.ObjectId(context.user.userId);
//     const query: FilterQuery<typeof MessageModel> = {createdBy: userId};
//     const messages = await MessageModel.find(query);
//     return messages;
//   }

//    @Query(() => Topic)
//    public async topic(@Arg("id") id: string, @Ctx() context: Context) {
//     try {
//         const userId = new mongoose.Types.ObjectId(context.user.userId);
//         const topicId = new mongoose.Types.ObjectId(id);
//         const query: FilterQuery<typeof TopicModel> = {
//             _id: topicId,
//             shares: {$elemMatch: {userId}}
//         };
//         const topic = await TopicModel.findOne(query);
//         if (!topic) {
//             throw new Error('Topic not found');
//         }
//         topic.setMyShare(userId);
//         return topic.toObjectWithMyShare();
//     } catch (error) {
//         throw new Error(error);
//     }
//    }

  @Authorized(['user'])
  @Mutation(() => Message)
  public async createMessageInTopic(@Ctx() context: Context, @Arg('data') data: CreateMessageInTopicInput) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const topicId = new mongoose.Types.ObjectId(data.topicId);
    const topic = await TopicModel.findOneAndCheckRole(topicId, userId, false);
    const newMessage = new MessageModel();
    newMessage.createdBy = userId;
    newMessage.updatedBy = userId;
    newMessage.text = data.text;
    newMessage.topicId = topicId;

    console.log('newMessage', newMessage);

    const createdMessage = await newMessage.save();
    console.log('createdMessage', createdMessage);
    const createdMessageInstance = new MessageModel(createdMessage);
    console.log('createdMessage', createdMessage);
    return createdMessageInstance.toObject();
  }

  @Authorized(['user'])
  @Mutation(() => Message)
  public async editMessage(@Ctx() context: Context, @Arg('data') data: EditMessageInput) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const messageId = new mongoose.Types.ObjectId(data.id);
    const originalMessage = await MessageModel.findOne({createdBy: userId, _id: messageId});
    if (!originalMessage) {
        throw new Error('Message not found');
    }
    originalMessage.updatedBy = userId;
    originalMessage.text = data.text;

    const editedMessage = await originalMessage.save();
    const editedMessageInstance = new MessageModel(editedMessage);
    return editedMessageInstance.toObject();
  }

  @Authorized(['user'])
  @Mutation(() => Message)
  public async removeMessage(@Ctx() context: Context, @Arg('id') id: string) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const messageId = new mongoose.Types.ObjectId(id);
    const originalMessage = await MessageModel.findOne({createdBy: userId, _id: messageId});
    if (!originalMessage) {
        throw new Error('Message not found');
    }
    originalMessage.text = '';
    originalMessage.deleted = true;
    const editedMessage = await originalMessage.save();
    const editedMessageInstance = new MessageModel(editedMessage);
    return editedMessageInstance.toObject();
  }

}
