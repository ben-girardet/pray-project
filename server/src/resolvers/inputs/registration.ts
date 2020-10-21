import { InputType, Field } from "type-graphql";

@InputType()
export class RegisterInput {

    @Field()
    firstname: string;

    @Field()
    lastname: string;

    @Field({nullable: true})
    email?: string;

    @Field({nullable: true})
    mobile?: string;
}

@InputType()
export class ValidateRegistrationInput {

    @Field()
    token: string;

    @Field()
    code: string;

    @Field()
    type: 'email' | 'mobile';

    @Field()
    password: string;
}
