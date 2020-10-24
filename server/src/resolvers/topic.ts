import { CreateTopicInput, EditTopicInput } from './inputs/topic';
import { Topic, TopicModel } from "../models/topic";
import { Share } from "../models/share";
import { Resolver, Query, Arg, Authorized, Ctx, Mutation } from "type-graphql";
import { FilterQuery } from 'mongoose';
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";

@Resolver()
export class TopicResolver {

  @Authorized(['user'])
  @Query(() => [Topic])
  public async topics(@Ctx() context: Context) {
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const query: FilterQuery<typeof TopicModel> = {shares: {$elemMatch: {userId}}};
    const topics = await TopicModel.find(query);
    for (const topic of topics) {
        topic.setMyShare(userId);
    }
    return topics.map(t => t.toObjectWithMyShare());
  }

   @Query(() => Topic)
   public async topic(@Arg("id") id: string, @Ctx() context: Context) {
    try {
        const userId = new mongoose.Types.ObjectId(context.user.userId);
        const topicId = new mongoose.Types.ObjectId(id);
        const query: FilterQuery<typeof TopicModel> = {
            _id: topicId,
            shares: {$elemMatch: {userId}}
        };
        const topic = await TopicModel.findOne(query);
        if (!topic) {
            throw new Error('Topic not found');
        }
        topic.setMyShare(userId);
        return topic.toObjectWithMyShare();
    } catch (error) {
        throw new Error(error);
    }
   }

  @Authorized(['user'])
  @Mutation(() => Topic)
  public async createTopic(@Ctx() context: Context, @Arg('data') data: CreateTopicInput) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const newTopic = new TopicModel();
    newTopic.createdBy = userId;
    newTopic.updatedBy = userId;
    newTopic.name = data.name;
    newTopic.description = data.description;
    newTopic.image = data.image ? data.image : [];
    newTopic.color = data.color;

    const share = new Share();
    share.userId = userId;
    share.encryptedBy = userId;
    share.encryptedContentKey = data.encryptedContentKey;
    share.role = ['owner'];
    newTopic.shares.push(share);
    const createdTopic = await newTopic.save();
    const createdTopicInstance = new TopicModel(createdTopic);
    createdTopicInstance.setMyShare(userId);
    return createdTopicInstance.toObjectWithMyShare();
  }

  @Authorized(['user'])
  @Mutation(() => Topic)
  public async editTopic(@Ctx() context: Context, @Arg('id') id: string, @Arg('data') data: EditTopicInput) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const topicId = new mongoose.Types.ObjectId(id);
    // const originalTopic = await TopicModel.findOne({_id: topicId, shares: {$elemMatch: {userId}}});
    // if (!originalTopic) {
    //     throw new Error('Topic not found');
    // }
    // originalTopic.setMyShare(userId);
    // if (!originalTopic.myShare || !originalTopic.myShare.role.some(r => context.user.roles.includes(r))) {
    //     throw new Error('Access denied');
    // }
    const originalTopic = await TopicModel.findOneAndCheckRole(topicId, userId, ['owner', 'write']);

    originalTopic.updatedBy = userId;
    originalTopic.name = data.name !== undefined ? data.name : originalTopic.name;
    originalTopic.description = data.description !== undefined ? data.description : originalTopic.description;
    originalTopic.image = data.image !== undefined ? data.image : originalTopic.image;
    originalTopic.color = data.color !== undefined ? data.color : originalTopic.color;

    const updatedTopic = await originalTopic.save();
    const updatedTopicInstance = new TopicModel(updatedTopic);
    updatedTopicInstance.setMyShare(userId);
    return updatedTopicInstance.toObjectWithMyShare();
  }

}
