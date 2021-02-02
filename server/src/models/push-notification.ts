import { User } from "./user";
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

    public async sendPrayerNotification(fromUserId: mongoose.Types.ObjectId, topicId: mongoose.Types.ObjectId) {
        const topic = await TopicModel.findById(topicId);
        if (!topic) {
            return;
        }
        const userIds = topic.shares.map(s => s.userId).filter(id => !id.equals(fromUserId));
        const players = await PushPlayerModel.find({active: true, tags: {$in: ['prayer']}, user: {$in: userIds}});
        const regIds = players.map(p => p.regId);

        const notification = new PushNotificationModel();
        notification.regIds = regIds;
        notification.title = 'New prayer';
        notification.message = 'Céline prayed for you';

        const notificationDocument = await notification.save();
        const createdNotification = new PushNotificationModel(notificationDocument);

        pushService.send(createdNotification);
    }
}

const PushNotificationModel = getModelForClass(PushNotification, {schemaOptions: {timestamps: false}});
export { PushNotificationModel };
