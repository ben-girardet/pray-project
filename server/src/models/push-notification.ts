import { User, UserModel } from "./user";
import { ObjectType, Field, Authorized } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { TopicModel } from "./topic";
import { PushPlayerModel } from "./push-player";
import { pushService } from '../core/push-service';

@ObjectType()
export class PushNotification {

    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    public _id: mongoose.Types.ObjectId;

    // @Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public regIds: Array<string> = [];

    // @Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public sentToRegIds: Array<string> = [];

    // @Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public viewedByRegIds: Array<string> = [];

    //@Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public openedByRegIds: Array<string> = [];

    @prop()
    public title: string;

    @prop()
    public message: string;

    @prop()
    public collapseKey?: string;

    @prop()
    public contentAvailable?: boolean = false;

    @prop()
    public badge?: number;

    @prop()
    public custom: string;

    //@Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public sendToTags: Array<string> = [];

    @prop({index: true})
    public sent: boolean = false;

    @prop()
    public sentAt: Date;

    public static async sendPrayerNotification(fromUserId: mongoose.Types.ObjectId, topicId: mongoose.Types.ObjectId, topicExcerpt?: string) {
        const topic = await TopicModel.findById(topicId);
        const fromUser = await UserModel.findByIdWithCache(fromUserId);
        if (!topic || !fromUser) {
            return;
        }
        const userIds = topic.shares.map(s => s.userId).filter(id => !id.equals(fromUserId));
        const players = await PushPlayerModel.find({active: true, tags: {$in: ['prayer']}, user: {$in: userIds}});
        const regIds = players.map(p => p.regId);

        const notification = new PushNotificationModel();
        notification.regIds = regIds;
        notification.title = `${fromUser.firstname} prayed for`;
        notification.message = topicExcerpt || 'one of your topic';

        const notificationDocument = await notification.save();
        const createdNotification = new PushNotificationModel(notificationDocument);

        pushService.send(createdNotification);
    }

    public static async sendMessageNotification(fromUserId: mongoose.Types.ObjectId, topicId: mongoose.Types.ObjectId, topicExcerpt?: string, messageExcerpt?: string) {
        const topic = await TopicModel.findById(topicId);
        const fromUser = await UserModel.findByIdWithCache(fromUserId);
        if (!topic || !fromUser) {
            return;
        }
        const userIds = topic.shares.map(s => s.userId).filter(id => !id.equals(fromUserId));
        const players = await PushPlayerModel.find({active: true, tags: {$in: ['message']}, user: {$in: userIds}});
        const regIds = players.map(p => p.regId);

        const notification = new PushNotificationModel();
        notification.regIds = regIds;
        notification.title = `${fromUser.firstname} wrote ${topicExcerpt ? `in ${topicExcerpt}` : 'a message'}`;
        if (messageExcerpt) {
            notification.message = messageExcerpt;
        }

        const notificationDocument = await notification.save();
        const createdNotification = new PushNotificationModel(notificationDocument);

        pushService.send(createdNotification);
    }

    public static async sendAnsweredNotification(topicId: mongoose.Types.ObjectId, topicExcerpt?: string) {
        // TODO: handle the situation where the person who
        // created the topic might not be the final owner
        // or the one who mark it as answered
        const topic = await TopicModel.findById(topicId);
        if (!topic) {
            return;
        }
        const fromUser = await UserModel.findByIdWithCache(topic.createdBy);
        if (!fromUser) {
            return;
        }
        const userIds = topic.shares.map(s => s.userId).filter(id => !id.equals(fromUser._id));
        const players = await PushPlayerModel.find({active: true, tags: {$in: ['answer']}, user: {$in: userIds}});
        const regIds = players.map(p => p.regId);

        const notification = new PushNotificationModel();
        notification.regIds = regIds;
        notification.title = `${topicExcerpt ? topicExcerpt : 'A topic'} has been answered`;
        notification.message = 'Praise God !';

        const notificationDocument = await notification.save();
        const createdNotification = new PushNotificationModel(notificationDocument);

        pushService.send(createdNotification);
    }
}

const PushNotificationModel = getModelForClass(PushNotification, {schemaOptions: {timestamps: false}});
export { PushNotificationModel };
