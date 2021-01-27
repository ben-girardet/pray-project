import { existsAsync, lpushAsync, delAsync } from './../core/redis';
import { TopicModel } from "../models/topic";
import { CustomerRequest, CustomerRequestModel } from "../models/customer-request";
import { Resolver, Arg, Authorized, Ctx, Mutation, Query, InputType, Field } from "type-graphql";
import { Context } from "./context-interface";
import { mongoose } from "@typegoose/typegoose";
import { TopicResolver } from './topic';

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


}
