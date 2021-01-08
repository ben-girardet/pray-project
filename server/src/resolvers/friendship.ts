import { TopicResolver } from './topic';
import { Friendship, FriendshipModel } from "../models/friendship";
import { User, UserModel } from "../models/user";
import { Resolver, Query, Arg, Authorized, Ctx, Mutation } from "type-graphql";
import { FilterQuery } from 'mongoose';
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";
import { SortBy, SortOrder } from './inputs/sorting';
import { getModelItems, saveModelItems, delAsync, saveModelItem } from './../core/redis';
import { ActivityModel } from "../models/activity";
import { TopicModel } from "../models/topic";
import { MessageModel } from "../models/message";
import { PrayerModel } from "../models/prayer";

@Resolver()
export class FriendshipResolver {

  @Authorized(['user'])
  @Mutation(() => Friendship)
  public async requestFriendship(@Ctx() context: Context, @Arg('friendId') friendId: string) {
    const userId = new mongoose.Types.ObjectId(context.user.userId);

    const user = await UserModel.findById(userId);
    const friend = await UserModel.findById(new mongoose.Types.ObjectId(friendId));

    if (!user || !friend) {
        throw new Error('Invalid request');
    }

    const existingFriendship = await FriendshipModel.findOne({$and: [
        {$or: [
            {user1: userId, user2: friend._id},
            {user1: friend._id, user2: userId}
        ]},
        {status: {$ne: 'removed'}},
        {status: {$ne: 'declined'}},
    ]});

    if (existingFriendship) {
        if (existingFriendship.status === 'requested') {
            throw new Error('Friendship request already exists');
        }
        if (existingFriendship.status === 'accepted') {
            throw new Error('Friendship already exists');
        }
    }

    const newFriendship = new FriendshipModel();
    newFriendship.user1 = userId;
    newFriendship.user2 = friend._id;
    newFriendship.requestedBy = userId;
    newFriendship.requestedAt = new Date();
    newFriendship.status = 'requested';

    const createdFriendship = await newFriendship.save();
    const createdFriendshipInstance = new FriendshipModel(createdFriendship);
    await this.clearFriendshipsCacheKeyForUser(user._id.toString());
    await this.clearFriendshipsCacheKeyForUser(friend._id.toString());
    return createdFriendshipInstance.toObject();
  }

  @Authorized(['user'])
  @Mutation(() => Friendship)
  public async respondToFriendshipRequest(@Ctx() context: Context, @Arg('friendshipId') friendshipId: string, @Arg('response') response: string) {
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const user = await UserModel.findById(userId);
    const friendship = await FriendshipModel.findOne({
        _id: new mongoose.Types.ObjectId(friendshipId),
        status: 'requested',
        requestedBy: {$ne: userId},
        user2: userId
    });

    if (!user || !friendship) {
        throw new Error('Invalid request2');
    }

    if (response === 'accepted' || response === 'declined') {
        friendship.status = response;
        friendship.respondedAt = new Date();
    } else {
        throw new Error('Invalid request');
    }

    const updatedFriendship = await friendship.save();
    const updatedFriendshipInstance = new FriendshipModel(updatedFriendship);
    await this.clearFriendshipsCacheKeyForUser((friendship.user1 as any).toString());
    await this.clearFriendshipsCacheKeyForUser((friendship.user2 as any).toString());
    if (updatedFriendshipInstance.status === 'accepted') {
        ActivityModel.friendship(
            updatedFriendshipInstance.user1 as mongoose.Types.ObjectId,
            updatedFriendshipInstance.user2 as mongoose.Types.ObjectId);
    }
    return updatedFriendshipInstance.toObject();
  }

  @Authorized(['user'])
  @Mutation(() => Boolean)
  public async removeFriendship(@Ctx() context: Context, @Arg('friendshipId') friendshipId: string) {
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error('Invalid request');
    }
    const friendship = await FriendshipModel.findOne({$and: [
        {_id: new mongoose.Types.ObjectId(friendshipId), status: {$in: ['accepted', 'requested']}},
        { $or: [{user1: userId}, {user2: userId}]}
    ]});

    if (!friendship) {
        throw new Error('Invalid request');
    }

    friendship.status = 'removed';
    friendship.removedAt = new Date();

    await friendship.save();
    await this.clearFriendshipsCacheKeyForUser((friendship.user1 as any).toString());
    await this.clearFriendshipsCacheKeyForUser((friendship.user2 as any).toString());

    const otherUserId: mongoose.Types.ObjectId = userId.equals(friendship.user1 as mongoose.Types.ObjectId) ? friendship.user2 as mongoose.Types.ObjectId : friendship.user1 as mongoose.Types.ObjectId;

    const topicsToRemoveShare = await TopicModel.find({$and:[
        {shares: {$elemMatch: {userId: userId, role: 'owner'}}},
        {shares: {$elemMatch: {userId: otherUserId, role: 'member'}}},
    ]});

    for (const topic of topicsToRemoveShare) {
        const nbOwner = topic.shares.filter(s => s.role === 'owner');
        // if several owners, we assume the removed friend can keep access
        if (nbOwner.length > 1) {
            continue;
        }
        // if the remover of friendship is the only owner we remove the friend access
        topic.removeShare(otherUserId);
        topic.updatedBy = userId;
        const updatedTopic = await topic.save();
        const updatedTopicInstance = new TopicModel(updatedTopic);
        await saveModelItem('topic', updatedTopicInstance.toObject());
        // we decide not to update REDIS cache for this updates below
        // as it does not interfere witch anything special, it's more a cleaning purpose
        await MessageModel.updateMany({topicId: topic._id}, {$pull: {viewedBy: userId.toString()}});
        await PrayerModel.updateMany({topicId: topic._id}, {$pull: {viewedBy: userId.toString()}});
        for (const share of updatedTopicInstance.shares) {
            await TopicResolver.clearTopicsCacheKeyForUser(share.userId.toString());
        }
        // clear `unviewed:_____` REDIS cache of the use who
        // now have access to this topic
        await delAsync(`unviewed:${userId}`);
    }

    return true;
  }

  @Authorized(['user'])
  @Query(() => [Friendship])
  public async friendships(@Ctx() context: Context, @Arg('sort', {nullable: true}) sort: SortBy, @Arg('status', {nullable: true}) status: 'accepted' | 'requested') {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const cacheKey = `status:${status};sort:${JSON.stringify(sort)}`;
    const cacheValue = await getModelItems(this.computeFriendshipsCacheKey(userId.toString(), cacheKey));
    if (cacheValue) {
        return cacheValue.map((cv) => {
            const obj = new FriendshipModel(cv);
            return obj.toObject();
        });
    }
    const sortBy = {}
    if (sort) {
        sortBy[sort.field] = sort.order === SortOrder.ASC ? 1 : -1
    }
    const query: FilterQuery<typeof FriendshipModel> = {$or: [{user1: userId}, {user2: userId}]};
    if (status) {
        query.status = status === 'requested' ? 'requested' : 'accepted';
    } else {
        query.status = {$in: ['accepted', 'requested']};
    }
    const friendships = await FriendshipModel.find(query, null, {sort: sortBy});
    const objects = friendships.map(f => f.toObject());
    await saveModelItems(this.computeFriendshipsCacheKey(userId.toString(), cacheKey), objects, {time: 60 * 30});
    await this.registerFriendshipsCacheKeyForUser(userId.toString(), cacheKey);
    return objects;
  }

  private computeFriendshipsCacheKey(userId: string, cacheKey: string): string {
    return `friendships:${userId.toString()}:${cacheKey}`;
  }

  private async registerFriendshipsCacheKeyForUser(userId: string, key: string): Promise<void> {
    let keys = await getModelItems(`${userId}:friendships:cache-keys`, {primitive: true}) || [];
    if (keys.includes(key)) {
        return;
    }
    keys.push(key);
    await saveModelItems(`${userId}:friendships:cache-keys`, keys, {primitive: true});
}

private async clearFriendshipsCacheKeyForUser(userId: string): Promise<void> {
  const keys = await getModelItems(`${userId}:friendships:cache-keys`, {primitive: true});
  if (!keys || keys.length === 0) {
      return;
  }
  const friendshipKeys = keys.map(k => this.computeFriendshipsCacheKey(userId, k));
  for (const key of keys.concat(...friendshipKeys)) {
      await delAsync(key);
  }
}

}
