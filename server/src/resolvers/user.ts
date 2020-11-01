import { User, UserModel } from "../models/user";
import { Resolver, Query, Arg, Ctx, Mutation } from "type-graphql";
import { FilterQuery } from 'mongoose';
import { Context } from './context-interface';
import mongoose from 'mongoose';
import { EditMeInput } from './inputs/user';

@Resolver()
export class UserResolver {
  @Query(() => [User])
  public async users(@Arg("email", {nullable: true}) email?: string) {
      // TODO: restrict the users to those I'm related too (friendship)
    const query: FilterQuery<typeof UserModel> = {};
    if (email) {
        query.email = email;
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
