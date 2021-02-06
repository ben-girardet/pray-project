import { saveModelItems, getModelItems } from './../core/redis';
import { User } from "./user";
import { Topic } from './topic';
import { CustomerRequest as ICustomerRequest } from "shared/types/customer-request";
import { ObjectType, Field, ID } from "type-graphql";
import { prop, Ref, getModelForClass, DocumentType } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { identity } from './middleware/identity';

@ObjectType()
export class CustomerRequest implements ICustomerRequest {

    @Field(() => String)
    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    public _id: mongoose.Types.ObjectId;

    @Field(() => String)
    @prop()
    name: string;

    @Field(() => String)
    @prop()
    email: string;

    @Field(() => String)
    @prop()
    mobile: string;

    @Field(() => String)
    @prop()
    type: string;

    @Field(() => String)
    @prop()
    message: string;

    @Field(() => String)
    @prop()
    replied: boolean = false;

    @Field(() => String)
    @prop({type: String})
    status: 'opened' | 'in-progress' | 'closed' = 'opened';

    @prop({ref: () => User, index: true})
    public createdBy?: Ref<User>;

    @prop({ref: () => User})
    public updatedBy?: Ref<User>;

    @Field(() => Date)
    @prop({index: true})
    public createdAt: Date;

    @Field(() => Date)
    @prop()
    public updatedAt: Date;

}

const CustomerRequestModel = getModelForClass(CustomerRequest, {schemaOptions: {timestamps: true}});
// CustomerRequestModel.schema.pre('save', identity);
export { CustomerRequestModel };
