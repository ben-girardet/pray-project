import { ImageInput } from './../../models/image';
import { InputType, Field } from "type-graphql";

@InputType()
export class CreateTopicInput {

    @Field()
    name: string;

    @Field()
    color: string;

    @Field(type => String, {nullable: true})
    status: 'active' | 'answered' | 'archived';

    @Field(type => [ImageInput], {nullable: true})
    image?: ImageInput[];

    @Field()
    encryptedContentKey: string;
}

@InputType()
export class EditTopicInput {

    @Field({nullable: true})
    name?: string;

    @Field({nullable: true})
    color?: string;

    @Field(type => String, {nullable: true})
    status: 'active' | 'answered' | 'archived';

    @Field(type => [ImageInput], {nullable: true})
    image?: ImageInput[];
}

@InputType()
export class AddShareToTopicInput {

    @Field()
    userId: string;

    @Field()
    encryptedContentKey: string;

    @Field(type => [Boolean], {defaultValue: false})
    owner: boolean = false;

}
