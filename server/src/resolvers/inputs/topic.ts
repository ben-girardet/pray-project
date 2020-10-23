import { ImageInput } from './../../models/image';
import { InputType, Field } from "type-graphql";

@InputType()
export class CreateTopicInput {

    @Field()
    name: string;

    @Field()
    description: string;

    @Field()
    color: string;

    @Field(type => [ImageInput], {nullable: true})
    image?: ImageInput[];

    @Field()
    encryptedContentKey: string;
}
