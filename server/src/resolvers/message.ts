import { existsAsync, lpushAsync, delAsync } from './../core/redis';
import { CreateMessageInTopicInput, EditMessageInput } from './inputs/message';
import { TopicModel } from "../models/topic";
import { Message, MessageModel } from "../models/message";
import { ActivityModel } from "../models/activity";
import { Resolver, Arg, Authorized, Ctx, Mutation, Query } from "type-graphql";
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";
import { TopicResolver } from './topic';
import { UnviewedTopicModel } from '../models/unviewed-topic';
import { PushNotification } from './../models/push-notification';

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

   @Query(() => Message)
   public async message(@Arg("id") id: string, @Ctx() context: Context) {
    try {
        const userId = new mongoose.Types.ObjectId(context.user.userId);
        const messageId = new mongoose.Types.ObjectId(id);
        // TODO: add cache
        const message = await MessageModel.findById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }
        const topic = await TopicModel.findById(message.topicId);
        if (!topic) {
            throw new Error('Related topic not found');
        }
        topic.setMyShare(userId);
        if (topic.myShare === undefined) {
            throw new Error('Access denied');
        }
        return message.toObject();
    } catch (error) {
        throw new Error(error);
    }
   }

  @Authorized(['user'])
  @Mutation(() => Message)
  public async createMessageInTopic(@Ctx() context: Context, @Arg('data') data: CreateMessageInTopicInput, @Arg('topicExcerpt', {nullable: true}) topicExcerpt: string, @Arg('messageExcerpt', {nullable: true}) messageExcerpt: string) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const topicId = new mongoose.Types.ObjectId(data.topicId);
    const topic = await TopicModel.findOneAndCheckRole(topicId, userId, false);
    const newMessage = new MessageModel();
    newMessage.createdBy = userId;
    newMessage.updatedBy = userId;
    newMessage.text = data.text;
    newMessage.topicId = topicId;
    // (newMessage.viewedBy as any).addToSet(userId.toString());

    const createdMessage = await newMessage.save();
    const createdMessageInstance = new MessageModel(createdMessage);
    const messageObject = createdMessageInstance.toObject();

    const exists = await existsAsync(`topic-messages:${topicId.toString()}`)
    if (exists) {
        await lpushAsync(`topic-messages:${topicId.toString()}`, JSON.stringify(messageObject));
    }
    for (const share of topic.shares) {
        await UnviewedTopicModel.add(share.userId, topicId, messageObject._id);
        await TopicResolver.clearTopicsCacheKeyForUser(share.userId.toString());
        // clear `unviewed:_____` REDIS cache of all users
        // who have access to this topic
        // await delAsync(`unviewed:${share.userId.toString()}`);
    }
    await ActivityModel.message(userId, topic._id, createdMessage._id, 'create');
    await PushNotification.sendMessageNotification(userId, topic._id, topicExcerpt, messageExcerpt);
    return messageObject;
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
    if (originalMessage.topicId) {
        const exists = await existsAsync(`topic-messages:${originalMessage.topicId.toString()}`);
        if (exists) {
            await delAsync(`topic-messages:${originalMessage.topicId.toString()}`);
        }
    }
    if (originalMessage.topicId instanceof mongoose.Types.ObjectId) {
        await ActivityModel.message(userId, originalMessage.topicId as mongoose.Types.ObjectId, editedMessage._id, 'edit');
    }
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
    if (originalMessage.topicId) {
        const exists = await existsAsync(`topic-messages:${originalMessage.topicId.toString()}`);
        if (exists) {
            await delAsync(`topic-messages:${originalMessage.topicId.toString()}`);
        }
    }
    if (originalMessage.topicId instanceof mongoose.Types.ObjectId) {
        await ActivityModel.message(userId, originalMessage.topicId as mongoose.Types.ObjectId, editedMessage._id, 'delete');
    }
    return editedMessageInstance.toObject();
  }

}
