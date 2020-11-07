import { InputType, Field } from "type-graphql";

export enum SortOrder {
    ASC = 1,
    DESC = -1
}

@InputType()
export class SortBy {

    @Field()
    field: string;

    @Field()
    order: SortOrder;
}
