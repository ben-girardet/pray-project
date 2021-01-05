import { Activity } from '../models/activity';
import { Message, MessageModel } from '../models/message';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';

@Resolver(of => Activity)
export class ActivityMessageResolver /*implements ResolverInterface<User>*/ {

    constructor() {}

    @FieldResolver(() => Message, {nullable: true})
    public async message(@Root() activity: Activity) {
        if (!activity.message) {
            return null;
        }
        // TODO: add cache
        const message = await MessageModel.findOne({_id: activity.message});
        if (!message) {
            return null;
        }
        return message.toObject();
    }
}
