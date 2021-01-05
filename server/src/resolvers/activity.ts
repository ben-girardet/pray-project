import { Activity, ActivityModel } from "../models/activity";
import { Resolver, Query, Arg, Authorized, Ctx } from "type-graphql";
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";

@Resolver()
export class ActivityResolver {


  // TODO: add a date filtering option
  // BTW: the redis cache should prob. not save the whole activity feed of a user
  @Authorized(['user'])
  @Query(() => [Activity])
  public async activities(@Ctx() context: Context) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const activities = await ActivityModel.findUserActivitiesWithCache(userId);
    return activities;
  }

}
