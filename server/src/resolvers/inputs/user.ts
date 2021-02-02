import { ImageInput } from './../../models/image';
import { InputType, Field } from "type-graphql";
import { HelpId } from 'shared/types/user';

@InputType()
export class EditMeInput {

    @Field({nullable: true})
    firstname?: string;

    @Field({nullable: true})
    lastname?: string;

    @Field(type => [ImageInput], {nullable: true})
    picture?: ImageInput[];

    @Field(() => String, {nullable: true})
    viewedHelpId?: HelpId;

    @Field(() => String, {nullable: true})
    regId?: string;

    @Field(() => String, {nullable: true})
    pushType?: 'apn' | 'fcm';

    @Field(() => [String], {nullable: true})
    pushTags?: string[];

    @Field({nullable: true})
    pushActive?: boolean;
}
