import { User, UserModel } from "../models/user";
import { Resolver, Query, Arg, Ctx, Mutation, Authorized } from "type-graphql";
import { FilterQuery } from 'mongoose';
import { Context } from './context-interface';
import mongoose from 'mongoose';
import { EditMeInput } from './inputs/user';
import { FriendshipModel } from "../models/friendship";

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

  @Query(() => User)
  public async me(@Ctx() context: Context) {
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user.toObject();
  }

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

    const updatedUser = await user.save();
    const updatedUserInstance = new UserModel(updatedUser);
    return updatedUserInstance.toObject();
  }
}
