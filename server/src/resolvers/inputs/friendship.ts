import { ImageInput } from './../../models/image';
import { InputType, Field } from "type-graphql";

@InputType()
export class CreateFriendshipInput {

    @Field()
    friendId: string;

}
