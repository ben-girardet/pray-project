import { Encrypt } from './encrypt';
import { RoleType } from './../core/config';
import mongoose from 'mongoose';
import users from './users';
import topics from './topics';
import dotenv from 'dotenv';
import { UserModel } from '../models/user';
import { TopicModel } from '../models/topic';
import { Share } from '../models/share';

dotenv.config();

mongoose.connect(
    'mongodb://localhost:27017/',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.DBNAME
    }).then(async () => {
        try {
            for (const user of users) {
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
            for (const topic of topics) {
                const user = await UserModel.findOne({email: topic.userEmail});
                if (!user) {
                    continue;
                }
                const newTopic = new TopicModel();
                newTopic.createdBy = user._id;
                newTopic.updatedBy = user._id;
                newTopic.name = topic.name;
                newTopic.description = topic.description;
                newTopic.image = [];
                newTopic.image.push({fileId: 'original', width: 1200, height: 800});
                newTopic.image.push({fileId: 'thumb', width: 400, height: 300});
                newTopic.color = topic.color;

                const contentKey = Encrypt.generateKey();
                await Encrypt.encryptObject(newTopic, ['name', 'description'], contentKey);

                const share = new Share();
                share.userId = user._id;
                share.encryptedBy = user._id;
                share.encryptedContentKey = await Encrypt.encryptWithPair(contentKey, {epub: user.publicKey, epriv: user.privateKey, pub: '', priv: ''}, user.publicKey);
                share.role = 'owner';
                newTopic.shares.push(share);
                const createdTopic = await newTopic.save();
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }).catch((error) => {
        console.error(error);
    }).finally(() => {
        process.exit(0);
    });
