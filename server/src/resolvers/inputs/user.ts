import { ImageInput } from './../../models/image';
import { InputType, Field } from "type-graphql";

@InputType()
export class EditMeInput {

    @Field({nullable: true})
    firstname: string;

    @Field({nullable: true})
    lastname: string;

    @Field(type => [ImageInput], {nullable: true})
    picture?: ImageInput[];
}
