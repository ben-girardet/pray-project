import { Topic } from '../models/topic';
import { Message, MessageModel } from '../models/message';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';

@Resolver(of => Topic)
export class TopicMessagesResolver /*implements ResolverInterface<Topic>*/ {

    constructor() {}

    @FieldResolver(() => [Message])
    public async messages(@Root() topic: Topic) {
        const messages = await MessageModel.findTopicMessagesWithCache(topic._id);
        return messages;
    }

    @FieldResolver(() => Number)
    public async nbMessages(@Root() topic: Topic) {
        // TODO: improve by only fetching the number and not all the messages
        // of course caching the number in a different redis key
        const messages = await MessageModel.findTopicMessagesWithCache(topic._id);
        return messages.length;
    }
}
