import { getVersion } from '../core/version';
import { Resolver, Query, ObjectType, Field } from "type-graphql";

@ObjectType()
export class Version {
    @Field({nullable: true})
    public branch: string;
    @Field({nullable: true})
    public hash: string;
    @Field({nullable: true})
    public origHash: string;
    @Field({nullable: true})
    public v: string;
}

@Resolver()
export class VersionResolver {
  @Query(() => Version)
  version() {
    return getVersion();
  }
}
