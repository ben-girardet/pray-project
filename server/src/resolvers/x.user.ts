import { Topic } from '../models/topic';
import { User, UserModel } from '../models/user';
import { Message } from '../models/message';
import { Prayer } from '../models/prayer';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';
import { Friendship } from '../models/friendship';
@Resolver(of => Topic)
export class TopicUserResolver /*implements ResolverInterface<Topic>*/ {

    constructor() {}

    @FieldResolver(() => User)
    public async createdBy(@Root() instance: Topic) {
        const user = await UserModel.findByIdWithCache(instance.createdBy);
        return user;
    }

    @FieldResolver(() => User)
    public async updatedBy(@Root() instance: Topic) {
        const user = await UserModel.findByIdWithCache(instance.updatedBy);
        return user;
    }
}

@Resolver(of => Message)
export class MessageUserResolver /*implements ResolverInterface<Topic>*/ {

    constructor() {}

    @FieldResolver(() => User)
    public async createdBy(@Root() instance: Message) {
        const user = await UserModel.findByIdWithCache(instance.createdBy);
        return user;
    }

    @FieldResolver(() => User)
    public async updatedBy(@Root() instance: Message) {
        const user = await UserModel.findByIdWithCache(instance.updatedBy);
        return user;
    }
}

@Resolver(of => Prayer)
export class PrayerUserResolver /*implements ResolverInterface<Topic>*/ {

    constructor() {}

    @FieldResolver(() => User)
    public async createdBy(@Root() instance: Prayer) {
        const user = await UserModel.findByIdWithCache(instance.createdBy);
        return user;
    }

    @FieldResolver(() => User)
    public async updatedBy(@Root() instance: Prayer) {
        const user = await UserModel.findByIdWithCache(instance.updatedBy);
        return user;
    }
}

@Resolver(of => Friendship)
export class FriendshipUserResolver /*implements ResolverInterface<Topic>*/ {

    constructor() {}

    @FieldResolver(() => User)
    public async user1(@Root() instance: Friendship) {
        const user = await UserModel.findByIdWithCache(instance.user1);
        return user;
    }

    @FieldResolver(() => User)
    public async user2(@Root() instance: Friendship) {
        const user = await UserModel.findByIdWithCache(instance.user2);
        return user;
    }

    @FieldResolver(() => User)
    public async requestedBy(@Root() instance: Friendship) {
        const user = await UserModel.findByIdWithCache(instance.requestedBy);
        return user;
    }
}
