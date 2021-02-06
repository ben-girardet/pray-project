import { TopicModel } from "../models/topic";
import { CustomerRequest, CustomerRequestModel } from "../models/customer-request";
import { Resolver, Arg, Authorized, Ctx, Mutation, Query, InputType, Field } from "type-graphql";
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";
import moment from 'moment';
import { SortBy, SortOrder } from './inputs/sorting';
import { FilterQuery } from 'mongoose';

@InputType()
export class CreateCustomerRequestInput {

    @Field()
    name: string;

    @Field({nullable: true})
    email: string;

    @Field({nullable: true})
    mobile: string;

    @Field()
    message: string;

    @Field()
    type: string;
}

@Resolver()
export class CustomerRequestResolver {

  @Mutation(() => Boolean)
  public async createCustomerRequest(@Ctx() context: Context, @Arg('data') data: CreateCustomerRequestInput) {

    if (data.type === 'request-beta') {
        if (!data.email) {
            throw new Error('Please provide your email');
        }
    } else if (data.type === 'feedback') {
        if (!data.email && !data.mobile) {
            throw new Error('Please provide an email or mobile number');
        }
    } else if (data.type === 'question') {
        if (!data.email && !data.mobile) {
            throw new Error('Please provide an email or mobile number');
        }
    } else {
        throw new Error('Invalid request');
    }

    const newCustomerRequest = new CustomerRequestModel();
    newCustomerRequest.name = data.name;
    newCustomerRequest.email = data.email;
    newCustomerRequest.mobile = data.mobile;
    newCustomerRequest.message = data.message;
    newCustomerRequest.type = data.type;

    const createdCustomerRequest = await newCustomerRequest.save();
    return true;
  }

  @Authorized(['user'])
  @Query(() => [CustomerRequest])
  public async requests(
      @Ctx() context: Context,
      @Arg('sort', {nullable: true}) sort: SortBy,
      @Arg('status', {nullable: true}) status: String,
      @Arg('since', {nullable: true}) since: String) {
    // Add a test of what is happening when login fails
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const userIdString = userId.toString();
    if (!context.user.roles.includes('admin')) {
        throw new Error('Access denied');
    }
    const sortBy = {}
    if (sort) {
        sortBy[sort.field] = sort.order === SortOrder.ASC ? 1 : -1
    }
    const query: FilterQuery<typeof TopicModel> = {shares: {$elemMatch: {userId}}};
    if (status) {
        query.status = status;
    }
    const requests = await CustomerRequestModel.find(query, null, {sort: sortBy});
    const objects = requests.map(t => t.toObject());
    if (since && moment(since.toString()).isValid()) {
        const sinceM = moment(since.toString());
        const sinceObjects = objects.filter(a => {
            return moment(a.date).isAfter(sinceM);
        });
        return sinceObjects;
    }
    return objects;
  }


}
