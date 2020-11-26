import { User } from '../models/user';
import { Message, MessageModel } from '../models/message';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';

@Resolver(of => User)
export class UserMessagesResolver /*implements ResolverInterface<User>*/ {

    constructor() {}

    @FieldResolver(() => [Message])
    public async messages(@Root() user: User) {
        const messages = await MessageModel.find({createdBy: user._id});
        return messages.map(m => m.toObject());
    }
}
