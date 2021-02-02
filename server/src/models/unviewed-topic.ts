import { delAsync } from './../core/redis';
import { UnviewedTopic as IUnviewedTopic } from 'shared/types/unviewed-topic';
import { ObjectType, Field } from "type-graphql";
import { prop, Ref, getModelForClass, mongoose } from "@typegoose/typegoose";
import { User } from "./user";
import { Topic } from './topic';

@ObjectType()
export class UnviewedTopic implements IUnviewedTopic {

    @Field(() => String)
    @prop({ref: () => 'Topic', index: true})
    public topicId: Ref<Topic>;

    @prop({ref: () => 'User', index: true})
    public userId: Ref<User>;

    @Field()
    @prop()
    public isViewed: boolean;

    @Field(() => [String])
    @prop({type: () => [String]})
    public messages: string[];

    @Field(() => [String])
    @prop({type: () => [String]})
    public prayers: string[];

    @Field(() => Date)
    @prop({index: true})
    public createdAt: Date;

    @Field(() => Date)
    @prop()
    public updatedAt: Date;


    public static async add(userId: mongoose.Types.ObjectId, topicId: mongoose.Types.ObjectId, messageId?: mongoose.Types.ObjectId, prayerId?: mongoose.Types.ObjectId, isViewed = true) {
        console.log('add unviewed');
        console.log('userId', userId);
        console.log('topicId', topicId);
        console.log('messageId', messageId);
        console.log('prayerId', prayerId);

        const unviewed = await UnviewedTopicModel.findOne({userId, topicId});
        const messageIdString = messageId ? messageId.toString() : undefined;
        const prayerIdString = prayerId ? prayerId.toString() : undefined;
        if (unviewed) {
            console.log('found one unviewed for this topic');
            if (messageIdString && !unviewed.messages.includes(messageIdString)) {
                unviewed.messages.push(messageIdString);
            }
            if (prayerIdString && !unviewed.prayers.includes(prayerIdString)) {
                unviewed.prayers.push(prayerIdString);
            }
            if (isViewed !== undefined) {
                unviewed.isViewed = isViewed;
            }
            await unviewed.save();
        } else {
            console.log('not found one unviewed for this topic');
            const unviewed = new UnviewedTopicModel();
            unviewed.userId = userId;
            unviewed.topicId = topicId;
            unviewed.messages = [];
            unviewed.prayers = [];
            if (messageIdString) {
                unviewed.messages.push(messageIdString);
            }
            if (prayerIdString) {
                unviewed.prayers.push(prayerIdString);
            }
            if (isViewed !== undefined) {
                unviewed.isViewed = isViewed;
            }
            console.log('saving new unviewed', unviewed);
            const savedUnviewd = await unviewed.save();
            console.log('savedUnviewd', savedUnviewd)
        }
        await delAsync(`unviewed:${userId.toString()}`);
    }
}

const UnviewedTopicModel = getModelForClass(UnviewedTopic, {schemaOptions: {timestamps: true}});
export { UnviewedTopicModel };
