import { Topic } from '../models/topic';
import { Prayer, PrayerModel } from '../models/prayer';
import { Resolver, FieldResolver, ResolverInterface, Root } from 'type-graphql';

@Resolver(of => Topic)
export class TopicPrayersResolver /*implements ResolverInterface<Topic>*/ {

    constructor() {}

    @FieldResolver(() => [Prayer])
    public async prayers(@Root() topic: Topic) {
        const prayers = await PrayerModel.findTopicPrayersWithCache(topic._id);
        return prayers;
    }

    @FieldResolver(() => Number)
    public async nbPrayers(@Root() topic: Topic) {
        const prayers = await PrayerModel.findTopicPrayersWithCache(topic._id);
        return prayers.length;
    }
}
