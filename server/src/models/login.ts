import { Login as ILogin } from "shared/types/login";
import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class Login implements ILogin {

    @Field(() => String)
    public token: string;

    @Field(() => Date)
    public expires: Date;

    @Field(() => String)
    public userId: string;


}
