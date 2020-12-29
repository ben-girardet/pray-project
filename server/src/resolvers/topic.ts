import { existsAsync, getModelItems, lpushAsync, saveModelItems, delAsync, getModelItem, saveModelItem } from './../core/redis';
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
import moment from 'moment';

@Resolver()
export class TopicResolver {

  @Authorized(['user'])
  @Query(() => [Topic])
  public async topics(@Ctx() context: Context, @Arg('sort', {nullable: true}) sort: SortBy, @Arg('status', {nullable: true}) status: String) {
    // Add a test of what is happening when login fails
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const userIdString = userId.toString();
    const cacheKey = `status:${status};sort:${JSON.stringify(sort)}`;
    const cacheValue = await getModelItems(TopicResolver.computeTopicsCacheKey(userIdString, cacheKey));
    if (cacheValue) {
        return cacheValue.map((cv) => {
            const obj = new TopicModel(cv);
            obj.myShare = cv.myShare;
            return obj.toObjectWithMyShare();
        });
    }
    const sortBy = {}
    if (sort) {
        sortBy[sort.field] = sort.order === SortOrder.ASC ? 1 : -1
    }
    const query: FilterQuery<typeof TopicModel> = {shares: {$elemMatch: {userId}}};
    if (status) {
        query.status = status;
    }
    const topics = await TopicModel.find(query, null, {sort: sortBy});
    for (const topic of topics) {
        topic.setMyShare(userId);
    }
    const objects = topics.filter((topic) => {
        // if topic is archived, only keep those where I'm owner
        if (topic.status === 'archived') {
            if (topic.myShare?.role !== 'owner') {
                return false;
            }
        }
        return true;
    }).map(t => t.toObjectWithMyShare());
    await saveModelItems(TopicResolver.computeTopicsCacheKey(userIdString, cacheKey), objects, {time: 60 * 30});
    await TopicResolver.registerTopicsCacheKeyForUser(userIdString, cacheKey);
    return objects;
  }

   @Query(() => Topic)
   public async topic(@Arg("id") id: string, @Ctx() context: Context) {
    try {
        const userId = new mongoose.Types.ObjectId(context.user.userId);
        const cacheValue = await getModelItem('topic', id);
        if (cacheValue) {
            const topic = new TopicModel(cacheValue);
            topic.setMyShare(userId);
            if (topic.myShare) {
                return topic.toObjectWithMyShare();
            }
        }
        const topicId = new mongoose.Types.ObjectId(id);
        const query: FilterQuery<typeof TopicModel> = {
            _id: topicId,
            shares: {$elemMatch: {userId}}
        };
        const topic = await TopicModel.findOne(query);
        if (!topic) {
            throw new Error('Topic not found');
        }
        await saveModelItem('topic', topic.toObject());
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
    newTopic.viewedBy = [userId.toString()];
    const createdTopic = await newTopic.save();
    const createdTopicInstance = new TopicModel(createdTopic);
    await saveModelItem('topic', createdTopicInstance.toObject());
    createdTopicInstance.setMyShare(userId);
    await TopicResolver.clearTopicsCacheKeyForUser(userId.toString());
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

    if (data.status === 'answered') {
        originalTopic.answeredAt = new Date();
    } else if (data.status === 'active' || data.status === 'archived') {
        originalTopic.answeredAt = undefined;
    }

    const updatedTopic = await originalTopic.save();
    const updatedTopicInstance = new TopicModel(updatedTopic);
    await saveModelItem('topic', updatedTopicInstance.toObject());
    updatedTopicInstance.setMyShare(userId);
    for (const share of updatedTopicInstance.shares) {
        await TopicResolver.clearTopicsCacheKeyForUser(share.userId.toString());
    }
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
    await saveModelItem('topic', updatedTopicInstance.toObject());
    updatedTopicInstance.setMyShare(loggedInUserId);
    for (const share of updatedTopicInstance.shares) {
        await TopicResolver.clearTopicsCacheKeyForUser(share.userId.toString());
    }
    // clear `unviewed:_____` REDIS cache of the use who
    // now have access to this topic
    await delAsync(`unviewed:${data.userId}`);
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
    await saveModelItem('topic', updatedTopicInstance.toObject());
    // we decide not to update REDIS cache for this updates below
    // as it does not interfere witch anything special, it's more a cleaning purpose
    await MessageModel.updateMany({topicId}, {$pull: {viewedBy: userId.toString()}});
    await PrayerModel.updateMany({topicId}, {$pull: {viewedBy: userId.toString()}});
    updatedTopicInstance.setMyShare(loggedInUserId);
    for (const share of updatedTopicInstance.shares) {
        await TopicResolver.clearTopicsCacheKeyForUser(share.userId.toString());
    }
    // clear `unviewed:_____` REDIS cache of the use who
    // now have access to this topic
    await delAsync(`unviewed:${userId}`);
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
    await PrayerModel.deleteMany({topicId});
    await originalTopic.remove();
    for (const share of originalTopic.shares) {
        await TopicResolver.clearTopicsCacheKeyForUser(share.userId.toString());
        // clear `unviewed:_____` REDIS cache of all users
        // who used to have access to this topic
        await delAsync(`unviewed:${share.userId.toString()}`);
    }
    await delAsync(`topic:${originalTopic._id}`)
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
    newPrayer.viewedBy = [userId.toString()];
    const createdPrayer = await newPrayer.save();
    const prayerObject = createdPrayer.toObject();
    const exists = await existsAsync(`topic-prayers:${topicId.toString()}`)
    if (exists) {
        await lpushAsync(`topic-prayers:${topicId.toString()}`, JSON.stringify(prayerObject));
    }
    for (const share of topic.shares) {
        await TopicResolver.clearTopicsCacheKeyForUser(share.userId.toString());
        // clear `unviewed:_____` REDIS cache of all users
        // who have access to this topic
        await delAsync(`unviewed:${share.userId.toString()}`);
    }

    return prayerObject;
  }

  @Authorized(['user'])
  @Mutation(() => Boolean)
  public async viewed(@Ctx() ctx: Context, @Arg('date', {nullable: true}) date: string, @Arg('context') context: string, @Arg('topicId', {nullable: false}) topicId: string) {
    const user = ctx.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const dateMoment = moment(date);
    if (!dateMoment.isValid()) {
        throw new Error('Invalid date');
    }
    if (context === 'topic') {
        await TopicModel.updateOne({
            _id: new mongoose.Types.ObjectId(topicId)
        }, {$addToSet: {viewedBy: userId.toString()}});
    } else if (context === 'messages') {
        if (!date) {
            throw new Error('Missing date');
        }
        const result1 = await MessageModel.updateMany({
            createdAt: {$lte: dateMoment.add(1, 'second').toDate()},
            topicId: new mongoose.Types.ObjectId(topicId)
        }, {$addToSet: {viewedBy: userId.toString()}});
        await PrayerModel.updateMany({
            createdAt: {$lte: dateMoment.add(1, 'second').toDate()},
            topicId: new mongoose.Types.ObjectId(topicId)
        }, {$addToSet: {viewedBy: userId.toString()}});
    }
    return true;
  }

  private static computeTopicsCacheKey(userId: string, cacheKey: string): string {
    return `topics:${userId.toString()}:${cacheKey}`;
  }

  private static async registerTopicsCacheKeyForUser(userId: string, key: string): Promise<void> {
      let keys = await getModelItems(`${userId}:topics:cache-keys`, {primitive: true}) || [];
      if (keys.includes(key)) {
          return;
      }
      keys.push(key);
      await saveModelItems(`${userId}:topics:cache-keys`, keys, {primitive: true});
  }

  public static async clearTopicsCacheKeyForUser(userId: string): Promise<void> {
    const keys = await getModelItems(`${userId}:topics:cache-keys`, {primitive: true});
    if (!keys || keys.length === 0) {
        return;
    }
    const topicKeys = keys.map(k => TopicResolver.computeTopicsCacheKey(userId, k));
    for (const key of keys.concat(...topicKeys)) {
        await delAsync(key);
    }
  }

}
