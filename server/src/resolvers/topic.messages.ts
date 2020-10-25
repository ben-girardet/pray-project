import { Topic } from '../models/topic';
import { Message, MessageModel } from '../models/message';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';

@Resolver(of => Topic)
export class TopicMessagesResolver /*implements ResolverInterface<Topic>*/ {

    constructor() {}

    @FieldResolver(() => [Message])
    public async messages(@Root() topic: Topic) {
        const messages = await MessageModel.find({topicId: topic._id});
        return messages;
    }
}
