import { Activity } from '../models/activity';
import { Topic, TopicModel } from '../models/topic';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';

@Resolver(of => Activity)
export class ActivityTopicResolver /*implements ResolverInterface<User>*/ {

    constructor() {}

    @FieldResolver(() => Topic, {nullable: true})
    public async topic(@Root() activity: Activity) {
        if (!activity.topic) {
            return null;
        }
        // TODO: add cache
        const topic = await TopicModel.findOne({_id: activity.topic});
        if (!topic) {
            return null;
        }
        return topic.toObject();
    }
}
