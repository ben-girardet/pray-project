import { setAsync, client } from './../core/redis';
import { User, UserModel } from "../models/user";
import { Resolver, Query, Arg, Ctx, Mutation, Authorized, ObjectType, Field } from "type-graphql";
import { FilterQuery } from 'mongoose';
import { Context } from './context-interface';
import mongoose from 'mongoose';
import { EditMeInput } from './inputs/user';
import { FriendshipModel } from "../models/friendship";
import { removeModelItem } from "../core/redis";
import { TopicModel } from "../models/topic";
import { MessageModel } from "../models/message";
import { PrayerModel } from "../models/prayer";
import { UnviewedTopic as IUnviewedTopic } from 'shared/types/unviewed-topic';
import PhoneNumber from 'awesome-phonenumber';
import { PushPlayerModel } from '../models/push-player';

@Resolver()
export class UserResolver {

  @Authorized(['user'])
  @Query(() => [User])
  public async users(@Ctx() context: Context, @Arg("search", {nullable: false}) search: string, @Arg("alreadyFriends", {nullable: true}) alreadyFriends: boolean) {
    const query: FilterQuery<typeof UserModel> = {};
    if (search.length < 3) {
        throw new Error('users query is only allowed for 3+ search word');
    }

    query.$or = [
        {email: search},
        {mobile: search},
        {firstname: {$regex: `${search}`, $options: 'i'}},
        {lastname: {$regex: `${search}`, $options: 'i'}}
    ];

    for (const countryCode of ['ch']) {
        const phoneNumber = new PhoneNumber( search, countryCode );
        if (phoneNumber.isValid()) {
            query.$or.push({mobile: phoneNumber.getNumber()});
        }
    }

    if (alreadyFriends === true || alreadyFriends === false) {
        const userId = new mongoose.Types.ObjectId(context.user.userId);
        const friendships = await FriendshipModel.find({$or: [
            {user1: userId},
            {user2: userId}
        ], status: 'accepted'});
        const friendsIds: mongoose.Types.ObjectId[] = [];
        for (const friendship of friendships) {
            if (friendship.user1 !== undefined) {
                const f1 = friendship.user1 as mongoose.Types.ObjectId;
                if (!f1.equals(userId)) {
                    friendsIds.push(f1);
                }
            }
            if (friendship.user2 !== undefined) {
                const f2 = friendship.user2 as mongoose.Types.ObjectId;
                if (!f2.equals(userId)) {
                    friendsIds.push(f2);
                }
            }
        }
        if (alreadyFriends) {
            query._id = {$in: friendsIds};
        } else {
            friendsIds.push(userId);
            query._id = {$nin: friendsIds};
        }
    } else if (alreadyFriends === undefined) {
        query._id = {$ne: new mongoose.Types.ObjectId(context.user.userId)};
    } else {
        throw new Error('Invalid request');
    }

    const users = await UserModel.find(query);
    const objects = users.map(u => u.toObject());
    return objects;
  }

  @Query(() => User)
  public async user(@Arg("id") id: string) {
    const user = await UserModel.findById(id);
    if (!user) {
        throw new Error('User not found');
    }
    return user.toObject();
  }

  @Authorized(['user'])
  @Query(() => User)
  public async me(@Ctx() context: Context) {
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user.toObject();
  }

  @Authorized(['user'])
  @Mutation(() => User)
  public async editMe(@Ctx() context: Context, @Arg('data') data: EditMeInput) {
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.firstname !== undefined) {
      user.firstname = data.firstname;
    }
    if (data.lastname !== undefined) {
      user.lastname = data.lastname;
    }
    if (data.picture !== undefined) {
      user.picture = data.picture;
    }
    if (data.viewedHelpId !== undefined) {
      if (!user.helpSeen || !Array.isArray(user.helpSeen)) {
        user.helpSeen = [];
      }
      if (!user.helpSeen.includes(data.viewedHelpId)) {
          user.helpSeen.push(data.viewedHelpId);
      }
    }

    if (user.firstname && user.lastname && user.picture !== undefined) {
        user.state = 1;
    }

    removeModelItem('user', user._id.toString());
    const updatedUser = await user.save();
    const updatedUserInstance = new UserModel(updatedUser);

    if (data.regId && data.pushTags) {
        const existingPlayer = await PushPlayerModel.findOne({user: updatedUserInstance._id});
        if (existingPlayer) {
            existingPlayer.regId = data.regId ? data.regId : existingPlayer.regId;
            existingPlayer.tags = data.pushTags ? data.pushTags : existingPlayer.tags;
            existingPlayer.active = data.pushActive !== undefined ? data.pushActive : existingPlayer.active;
            existingPlayer.type = data.pushType ? data.pushType : existingPlayer.type;
            await existingPlayer.save();
        } else {
            const newPlayer = new PushPlayerModel();
            newPlayer.user = updatedUserInstance._id;
            newPlayer.regId = data.regId;
            newPlayer.tags = data.pushTags;
            newPlayer.active = data.pushActive !== undefined ? data.pushActive : true;
            newPlayer.type = data.pushType || 'apn';
            await newPlayer.save();
        }
    }

    return updatedUserInstance.toObject();
  }

  @Authorized(['user'])
  @Query(() => [UnviewedTopic])
  public async unviewed(@Ctx() context: Context) {
    const userIdString = context.user.userId;
    const userId = new mongoose.Types.ObjectId(context.user.userId);

    // fetch all topics so that
    // - we can identify those unviewed
    // - AND we can fetch messages and prayers related to "my" topis
    const topics = await TopicModel.find({"shares.userId": userId}).select('_id viewedBy');
    const topicsIds = topics.map(t => t._id);
    const unviewedMessages = await MessageModel.find({"topicId": {$in: topicsIds}, viewedBy: {$nin: [userIdString]}}).select('_id topicId');
    const unviewedPrayers = await PrayerModel.find({"topicId": {$in: topicsIds}, viewedBy: {$nin: [userIdString]}}).select('_id topicId');

    // build the output for "unviewed"
    const result: UnviewedTopic[] = [];
    const unviewedMessagesByTopic: {[key: string]: string[]} = {};
    const unviewedPrayersByTopic: {[key: string]: string[]} = {};
    for (const unviewedMessage of unviewedMessages) {
        if (!unviewedMessage.topicId) {
            continue;
        }
        const topicIdString = unviewedMessage.topicId.toString();
        if (!Array.isArray(unviewedMessagesByTopic[topicIdString])) {
            unviewedMessagesByTopic[topicIdString] = [];
        }
        unviewedMessagesByTopic[topicIdString].push(unviewedMessage._id.toString());
    }
    for (const unviewedPrayer of unviewedPrayers) {
        if (!unviewedPrayer.topicId) {
            continue;
        }
        const topicIdString = unviewedPrayer.topicId.toString();
        if (!Array.isArray(unviewedPrayersByTopic[topicIdString])) {
            unviewedPrayersByTopic[topicIdString] = [];
        }
        unviewedPrayersByTopic[topicIdString].push(unviewedPrayer._id.toString());
    }
    for (const topic of topics) {
        const unviewedTopic = new UnviewedTopic();
        const topicIdString = topic._id.toString();
        unviewedTopic.id = topicIdString;
        unviewedTopic.isViewed = (topic.viewedBy || []).includes(userIdString);
        unviewedTopic.messages = unviewedMessagesByTopic[topicIdString] || [];
        unviewedTopic.prayers = unviewedPrayersByTopic[topicIdString] || [];
        if (!unviewedTopic.isViewed || unviewedTopic.messages.length > 0 || unviewedTopic.prayers.length > 0) {
            result.push(unviewedTopic);
        }
    }

    // cache the result
    await setAsync(`unviewed:${userIdString}`, JSON.stringify(result));
    client.expire(`unviewed:${userIdString}`, 3600 * 12);

    return result;
  }

}
@ObjectType()
export class UnviewedTopic implements IUnviewedTopic {

    @Field()
    public id: string;

    @Field()
    public isViewed: boolean;

    @Field(() => [String])
    public messages: string[];

    @Field(() => [String])
    public prayers: string[];
}
