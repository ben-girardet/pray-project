import mongoose from 'mongoose';
import { prop } from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Share {

  @Field(() => String)
  @prop()
  userId: mongoose.Types.ObjectId;

  @Field(() => String)
  @prop()
  encryptedContentKey: string;

  @Field(() => String)
  @prop()
  encryptedBy: mongoose.Types.ObjectId;

  @Field(() => String)
  @prop({type: () => String})
  role: 'owner' | 'member';

}
