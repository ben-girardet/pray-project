import { Login as ILogin } from "shared/types/login";
import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class Login implements ILogin {

    @Field(() => String)
    public token: string;

    @Field(() => String, {nullable: true})
    public refreshToken?: string;

    @Field(() => String, {nullable: true})
    public refreshTokenExpiry?: string;

    @Field(() => Date)
    public expires: Date;

    @Field(() => String)
    public userId: string;

    @Field(() => String)
    public privateKey: string;

    // 0 = need to set identity
    // 1 = identity set and active
    // -1 inactive user
    @Field(() => Number)
    public state: number;


}
