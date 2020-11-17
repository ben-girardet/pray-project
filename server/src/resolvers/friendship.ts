import { Friendship, FriendshipModel } from "../models/friendship";
import { User, UserModel } from "../models/user";
import { Resolver, Query, Arg, Authorized, Ctx, Mutation } from "type-graphql";
import { FilterQuery } from 'mongoose';
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";
import { SortBy, SortOrder } from './inputs/sorting';

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
        {_id: new mongoose.Types.ObjectId(friendshipId), status: 'accepted'},
        { $or: [{user1: userId}, {user2: userId}]}
    ]});

    if (!friendship) {
        throw new Error('Invalid request');
    }

    friendship.status = 'removed';
    friendship.removedAt = new Date();

    await friendship.save();
    return true;
  }

  @Authorized(['user'])
  @Query(() => [Friendship])
  public async friendships(@Ctx() context: Context, @Arg('sort', {nullable: true}) sort: SortBy, @Arg('status', {nullable: true}) status: 'accepted' | 'requested') {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);

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
    return friendships.map(f => f.toObject());
  }

}
