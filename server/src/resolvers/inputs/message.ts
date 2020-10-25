import { ImageInput } from './../../models/image';
import { InputType, Field } from "type-graphql";

@InputType()
export class CreateMessageInTopicInput {

    @Field()
    topicId: string;

    @Field()
    text: string;
}

@InputType()
export class EditMessageInput {

    @Field()
    id: string;

    @Field()
    text: string;
}
