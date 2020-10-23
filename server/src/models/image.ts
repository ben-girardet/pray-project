import mongoose from 'mongoose';
import { prop } from '@typegoose/typegoose';
import { ObjectType, Field, InputType } from 'type-graphql';

@ObjectType()
export class Image {

  @Field(() => String)
  @prop()
  fileId: string;

  @Field(() => Number)
  @prop()
  width: number;

  @Field(() => Number)
  @prop()
  height: number;

}

@InputType()
export class ImageInput {

  @Field(() => String)
  @prop()
  fileId: string;

  @Field(() => Number)
  @prop()
  width: number;

  @Field(() => Number)
  @prop()
  height: number;

}
