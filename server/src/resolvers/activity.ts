import { Activity, ActivityModel } from "../models/activity";
import { Resolver, Query, Arg, Authorized, Ctx } from "type-graphql";
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";
import moment from 'moment';

@Resolver()
export class ActivityResolver {


  // TODO: add a date filtering option
  // BTW: the redis cache should prob. not save the whole activity feed of a user
  @Authorized(['user'])
  @Query(() => [Activity])
  public async activities(@Ctx() context: Context, @Arg('since', {nullable: true}) since: String) {
    const user = context.user;
    const userId = new mongoose.Types.ObjectId(user.userId);
    const activities = await ActivityModel.findUserActivitiesWithCache(userId);
    if (since && moment(since.toString()).isValid()) {
        const sinceM = moment(since.toString());
        const sinceActivities = activities.filter(a => {
            return moment(a.date).isAfter(sinceM);
        });
        return sinceActivities;
    }
    return activities;
  }

}
