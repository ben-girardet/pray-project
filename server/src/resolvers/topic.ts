import { User, UserModel } from "../models/user";
import { Topic, TopicModel } from "../models/topic";
import { Resolver, Query, Arg, Authorized, Ctx } from "type-graphql";
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
    return topics;
  }

//   @Query(() => User)
//   public async user(@Arg("id") id: string) {
//     const user = await UserModel.findById(id);
//     if (!user) {
//         throw new Error('User not found');
//     }
//     return user.toObject();
//   }
}
