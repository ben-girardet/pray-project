import { Encrypt } from './encrypt';
import { RoleType } from './../core/config';
import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import dotenv from 'dotenv';
import { UserModel } from '../models/user';
import { TopicModel, Topic } from '../models/topic';
import { MessageModel } from '../models/message';
import { PrayerModel } from '../models/prayer';
import { Share } from '../models/share';
import chalk from 'chalk';
import sharp from 'sharp';
import path from 'path';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24)
dotenv.config();

export async function importer(users: any[], topics: any[], messages: any[], prayers: any[]): Promise<void> {
    console.log('MONGOHOST', process.env.MONGOHOST);
    console.log('MONGOPORT', process.env.MONGOPORT);
    console.log('DBNAME', process.env.DBNAME);
    console.log('Running importer with');
    console.log(chalk.magenta(users.length), 'users');
    console.log(chalk.magenta(topics.length), 'topics');
    console.log(chalk.magenta(messages.length), 'messages');
    console.log(chalk.magenta(prayers.length), 'prayers');
    await mongoose.connect(
        `mongodb://${process.env.MONGOHOST}:${process.env.MONGOPORT}/`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: process.env.DBNAME,
            user: process.env.MONGOUSER,
            pass: process.env.MONGOPASSWORD,
        });
    console.log(chalk.dim('Connected to database'));
    const topicsByName: {[key: string]: DocumentType<Topic>} = {};
    const contentKeyByTopic: {[key: string]: string} = {};
    for (const user of users) {
        console.log(chalk.dim('Importing user', user.email || user.mobile));
        const existingUser = await UserModel.findOne(
            {email: user.email});
        if (!existingUser) {
            const newUser =  new UserModel();
            newUser.firstname = user.firstname;
            newUser.lastname = user.lastname;
            newUser.email = user.email || '';
            newUser.emailValidated = user.email !== undefined;
            newUser.mobile = user.mobile || '';
            newUser.mobileValidated = user.mobile !== undefined;
            newUser.hashPassword(user.password);
            newUser.roles = user.roles as unknown as RoleType[];
            const pair = await Encrypt.generatePair();
            newUser.privateKey = pair.epriv;
            newUser.publicKey = pair.epub;
            const createdUser = await newUser.save();
        }
    }
    console.log(chalk.dim('Users are imported'));
    for (const topic of topics) {
        const user = await UserModel.findOne({email: topic.userEmail});
        if (!user) {
            continue;
        }
        console.log(chalk.dim('Importing topic', topic.name, topic.status));
        const newTopic = new TopicModel({cursor: 1});
        newTopic.createdBy = user._id;
        newTopic.updatedBy = user._id;
        newTopic.name = topic.name;
        newTopic.image = topic.image ? await prepareImages(topic.image) : [];
        newTopic.color = topic.color;
        newTopic.status = topic.status || 'active';

        newTopic.createdAt = (topic as any).date ? (topic as any).date : undefined;
        newTopic.updatedAt = (topic as any).date ? (topic as any).date : undefined;
        newTopic.answeredAt = (topic as any).answeredAt ? (topic as any).answeredAt : undefined;

        const contentKey = Encrypt.generateKey();
        await Encrypt.encryptObject(newTopic, ['name'], contentKey);

        const share = new Share();
        share.userId = user._id;
        share.encryptedBy = user._id;
        share.encryptedContentKey = await Encrypt.encryptWithPair(contentKey, {epub: user.publicKey, epriv: user.privateKey, pub: '', priv: ''}, user.publicKey);
        share.role = 'owner';
        newTopic.shares.push(share);
        const createdTopic = await newTopic.save();
        contentKeyByTopic[createdTopic.id] = contentKey;
        topicsByName[topic.name] = new TopicModel(createdTopic);
    }
    console.log(chalk.dim('Topics are imported'));
    for (const message of messages) {
        const topic = topicsByName[message.topicName];
        const contentKey = contentKeyByTopic[topic.id];
        if (!topic) {
            console.log('topic not found');
            continue;
        }
        if (!contentKey) {
            console.log('contentKey not found');
            continue;
        }
        const user = await UserModel.findOne({email: message.userEmail});
        if (!user) {
            console.log('user not found');
            continue;
        }
        const newMessage = new MessageModel();
        newMessage.topicId = topic._id;
        newMessage.text = message.text;
        newMessage.createdBy = user._id;
        newMessage.updatedBy = user._id;
        newMessage.createdAt = (message as any).date ? (message as any).date : undefined;
        newMessage.updatedAt = (message as any).date ? (message as any).date : undefined;
        await Encrypt.encryptObject(newMessage, ['text'], contentKey);
        await newMessage.save();
    }
    console.log(chalk.dim('Messages are imported'));
    for (const prayer of prayers) {
        const topic = topicsByName[prayer.topicName];
        if (!topic) {
            console.log('topic not found');
            continue;
        }
        const user = await UserModel.findOne({email: prayer.userEmail});
        if (!user) {
            console.log('user not found');
            continue;
        }
        const newPrayer = new PrayerModel();
        newPrayer.topicId = topic._id;
        newPrayer.createdBy = user._id;
        newPrayer.updatedBy = user._id;
        newPrayer.createdAt = (prayer as any).date ? (prayer as any).date : undefined;
        newPrayer.updatedAt = (prayer as any).date ? (prayer as any).date : undefined;
        await newPrayer.save();
    }
    console.log(chalk.dim('Prayers are imported'));
}

async function prepareImages(filepath: string): Promise<{fileId: string, width: number, height: number}[]> {
    const sizes = [40, 100, 1000];
    const ratio = 1.2;
    const promises: Promise<{filepath: string, size: number}>[] = [];
    const ext = filepath.substr(-4);
    for (const size of sizes) {
        const newfilepath = nanoid() + ext;
        promises.push(new Promise((resolve, reject) => {
            const im = sharp(filepath)
                        .resize(size, size * 1.2)
                        .toFile(path.join(__dirname, '../../uploads/' + newfilepath), (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({filepath: newfilepath, size});
                            }
                        })
        }));
    }
    const images = (await Promise.all(promises)).map((v) => {return {
        fileId: 'api:' + v.filepath,
        width: v.size,
        height: v.size * 1.2
    }});
    return images;
}
