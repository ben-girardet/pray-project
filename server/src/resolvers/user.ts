import { User, UserModel } from "../models/user";
import { Resolver, Query, Arg } from "type-graphql";
import { FilterQuery } from 'mongoose';

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
}
