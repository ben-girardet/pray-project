import { Topic, TopicModel } from "../models/topic";
import { Share } from "../models/share";
import { Resolver, Query, Arg, Authorized, Ctx, Mutation } from "type-graphql";
import { FilterQuery } from 'mongoose';
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";
import { MessageModel } from '../models/message';
import { CreateTopicInput, EditTopicInput, AddShareToTopicInput } from './inputs/topic';
import { SortBy, SortOrder } from './inputs/sorting';
import { Prayer, PrayerModel } from "../models/prayer";
import { hsetAsync, hgetAllAsync, client } from '../core/redis';

@Resolver()
export class TopicResolver {

  @Authorized(['user'])
  @Query(() => [Topic])
  public async topics(@Ctx() context: Context, @Arg('sort', {nullable: true}) sort: SortBy, @Arg('status', {nullable: true}) status: String) {
    // Add a test of what is happening when login fails
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const sortBy = {}
    if (sort) {
        sortBy[sort.field] = sort.order === SortOrder.ASC ? 1 : -1
    }
    const query: FilterQuery<typeof TopicModel> = {shares: {$elemMatch: {userId}}};
    if (status) {
        query.status = status;
    }
    const cacheValue = await hgetAllAsync(`topics:${JSON.stringify(query)}:${JSON.stringify(sortBy)}`);
    if (cacheValue) {
        return cacheValue;
    }
    const topics = await TopicModel.find(query, null, {sort: sortBy});
    for (const topic of topics) {
        topic.setMyShare(userId);
    }
    const value = topics.map(t => t.toObjectWithMyShare());
    for (const key in value) {
        await hsetAsync(`topics:${JSON.stringify(query)}:${JSON.stringify(sortBy)}`, key, value[key]);
        client.expire(`topics:${JSON.stringify(query)}:${JSON.stringify(sortBy)}`, 5);
    }
    return value;
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
    newTopic.image = data.image ? data.image : [];
    newTopic.color = data.color;
    if (data.status) newTopic.status = data.status;

    const share = new Share();
    share.userId = userId;
    share.encryptedBy = userId;
    share.encryptedContentKey = data.encryptedContentKey;
    share.role = 'owner';
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
    const originalTopic = await TopicModel.findOneAndCheckRole(topicId, userId, true);

    originalTopic.updatedBy = userId;
    originalTopic.name = data.name !== undefined ? data.name : originalTopic.name;
    originalTopic.image = data.image !== undefined ? data.image : originalTopic.image;
    originalTopic.color = data.color !== undefined ? data.color : originalTopic.color;
    originalTopic.status = data.status !== undefined ? data.status : originalTopic.status;

    const updatedTopic = await originalTopic.save();
    const updatedTopicInstance = new TopicModel(updatedTopic);
    updatedTopicInstance.setMyShare(userId);
    return updatedTopicInstance.toObjectWithMyShare();
  }

  @Authorized(['user'])
  @Mutation(() => Topic)
  public async addShareToTopic(@Ctx() context: Context, @Arg('id') id: string, @Arg('data') data: AddShareToTopicInput) {
    const user = context.user;
    const loggedInUserId = new mongoose.Types.ObjectId(user.userId);
    const newShareUserId = new mongoose.Types.ObjectId(data.userId);
    const topicId = new mongoose.Types.ObjectId(id);
    const originalTopic = await TopicModel.findOneAndCheckRole(topicId, loggedInUserId, true);
    originalTopic.addShare(newShareUserId, loggedInUserId, data.encryptedContentKey, data.owner);
    originalTopic.updatedBy = loggedInUserId;
    const updatedTopic = await originalTopic.save();
    const updatedTopicInstance = new TopicModel(updatedTopic);
    updatedTopicInstance.setMyShare(loggedInUserId);
    return updatedTopicInstance.toObjectWithMyShare();
  }

  @Authorized(['user'])
  @Mutation(() => Topic)
  public async removeShareToTopic(@Ctx() context: Context, @Arg('id') id: string, @Arg('userId') userId: string) {
    const user = context.user;
    const loggedInUserId = new mongoose.Types.ObjectId(user.userId);
    const removeShareUserId = new mongoose.Types.ObjectId(userId);
    const topicId = new mongoose.Types.ObjectId(id);
    const originalTopic = await TopicModel.findOneAndCheckRole(topicId, loggedInUserId, true);
    originalTopic.removeShare(removeShareUserId);
    originalTopic.updatedBy = loggedInUserId;
    const updatedTopic = await originalTopic.save();
    const updatedTopicInstance = new TopicModel(updatedTopic);
    updatedTopicInstance.setMyShare(loggedInUserId);
    return updatedTopicInstance.toObjectWithMyShare();
  }

  @Authorized(['user'])
  @Mutation(() => Boolean)
  public async removeTopic(@Ctx() context: Context, @Arg('id') id: string) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const topicId = new mongoose.Types.ObjectId(id);
    const originalTopic = await TopicModel.findOneAndCheckRole(topicId, userId, true);
    await MessageModel.deleteMany({topicId});
    await originalTopic.remove();
    return true;
  }

  @Authorized(['user'])
  @Mutation(() => Prayer)
  public async pray(@Ctx() context: Context, @Arg('topicId') topicId: string) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const topic = await TopicModel.findOneAndCheckRole(new mongoose.Types.ObjectId(topicId), userId, false);
    const newPrayer = new PrayerModel();
    newPrayer.topicId = topic._id;
    newPrayer.createdBy = new mongoose.Types.ObjectId(context.user.userId);
    const createdPrayer = await newPrayer.save();
    return createdPrayer.toObject();
  }

}
