import { Topic } from '../models/topic';
import { User, UserModel } from '../models/user';
import { Message, MessageModel } from '../models/message';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';

@Resolver(of => Topic)
export class TopicUserResolver /*implements ResolverInterface<Topic>*/ {

    constructor() {}

    @FieldResolver(() => User)
    public async createdBy(@Root() topic: Topic) {
        const createdByUser = await UserModel.findById(topic.createdBy);
        return createdByUser?.toObject();
    }

    @FieldResolver(() => User)
    public async updatedBy(@Root() topic: Topic) {
        const updatedByUser = await UserModel.findById(topic.updatedBy);
        return updatedByUser?.toObject();
    }
}

@Resolver(of => Message)
export class MessageUserResolver /*implements ResolverInterface<Topic>*/ {

    constructor() {}

    @FieldResolver(() => User)
    public async createdBy(@Root() message: Message) {
        const createdByUser = await UserModel.findById(message.createdBy);
        return createdByUser?.toObject();
    }

    @FieldResolver(() => User)
    public async updatedBy(@Root() message: Message) {
        const updatedByUser = await UserModel.findById(message.updatedBy);
        return updatedByUser?.toObject();
    }
}
