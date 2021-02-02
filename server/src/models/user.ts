import crypto from 'crypto';
import { User as IUser, HelpId } from "shared/types/user";
import { ObjectType, Field, Authorized, FieldResolver, Ctx, Root, Resolver } from "type-graphql";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { RoleType } from '../core/config';
import moment from 'moment';
import { Image } from './image';
import { Context } from '../resolvers/context-interface';
import { FriendshipModel, Friendship } from "./friendship";
import { saveModelItem, getModelItem } from '../core/redis';
import { PushPlayerModel, PushPlayer } from './push-player';

export interface RefreshTokenData {
  refreshToken: string;
  hash: string;
  expiry: Date
}

export class RefreshToken {
  @prop()
  hash: string;

  @prop()
  expiry: Date;
}

@ObjectType()
@Resolver(of => User)
export class User implements IUser {

  // @prop()
  public _id: mongoose.Types.ObjectId;

  @Field(() => String)
  public get id(): string {
      return (this as any)._id ? (this as any)._id.toString() : '';
  };

  @Field(() => String)
  @prop()
  public firstname: string;

  @Field(() => String)
  @prop()
  public lastname: string;

  @Authorized(['me'])
  @Field(() => String, {nullable: true})
  @prop({index: true})
  public email: string;

  @prop()
  public emailValidated?: boolean;

  @Authorized(['me'])
  @Field(() => String)
  @prop({index: true})
  public mobile: string;

  @prop()
  public mobileValidated?: boolean;

  @Field(type => [Image], {nullable: true})
  @prop({type: () => [Image]})
  public picture?: Image[];

  @prop()
  public hash: string;

  @prop()
  public salt: string;

  @Field(() => String, {nullable: true})
  @prop()
  public publicKey: string;

  @Authorized(['me'])
  @prop()
  public privateKey: string;

  @prop()
  public facebookId?: string;

  @prop()
  public lastLogin?: Date;

  @Field(() => [String], {nullable: false})
  @prop({type: () => [String]})
  public roles: RoleType[];

  @prop({type: () => [RefreshToken], _id: false, select: false, index: true})
  public refreshTokens: RefreshToken[];

  // 0 = need to set identity
  // 1 = identity set and active
  // -1 inactive user
  @Authorized(['me'])
  @Field(() => Number)
  @prop()
  public state = 0;

  @Field(() => Date)
  @prop()
  public createdAt: Date;

  @Field(() => Date)
  @prop()
  public updatedAt: Date;

  @Authorized(['me'])
  @Field(() => [String], {nullable: false})
  @prop({type: () => [String]})
  public helpSeen: HelpId[];

  @Field(() => [Friendship])
  public async friendships(@Ctx() context: Context) {
    // TODO: add cache
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const friendships = await FriendshipModel.find({$or: [
        {user1: userId},
        {user2: userId}
    ]});
    const objects = friendships.map(f => f.toObject());
    return objects;
  }

  @Field(() => Number)
  public async nbFriends(@Ctx() context: Context) {
    // TODO: add cache
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const nbFriends = await FriendshipModel.find({$or: [
        {user1: userId},
        {user2: userId}
    ]}).count()
    return nbFriends;
  }

  @Field(() => String, {nullable: true})
  public async friendshipStatus(@Ctx() context: Context) {
    // TODO: add cache
    if (!context.locals.friendships) {
      context.locals.friendships = {};
      // fetch friendships and store them in the context
      const userId = new mongoose.Types.ObjectId(context.user.userId);
      const friendships = await FriendshipModel.find({$or: [
        {user1: userId},
        {user2: userId}
      ], status: {$in: ['accepted', 'requested']}});
      for (const friendship of friendships) {
        if (!friendship.user1 || !friendship.user2) {
          continue;
        }
        const f1 = friendship.user1 as unknown as mongoose.Types.ObjectId;
        const f2 = friendship.user2 as unknown as mongoose.Types.ObjectId;
        if (f1.equals(userId)) {
          context.locals.friendships[f2.toString()] = friendship.status;
        } else {
          context.locals.friendships[f1.toString()] = friendship.status;
        }
      }
    }
    return context.locals.friendships[this.id.toString()];
  }

  @Authorized(['me'])
  @FieldResolver(() => PushPlayer, {nullable: true})
    public async player(@Root() user: User) {
        const player = await PushPlayerModel.findOne({user: user._id});
        if (!player) {
            return null;
        }
        return player.toObject()
    }

  public hashPassword(password: string) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  }

  public isPasswordValid(password: string): boolean {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  }

  public generateRefreshToken(): RefreshTokenData {
    const refreshToken = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY as string, 10000, 512, 'sha512').toString('hex');
    const expiry = moment().add(30, 'days').toDate();
    this.refreshTokens.push({
      hash,
      expiry
    });
    return { refreshToken, hash, expiry };
  }

  public static async findByIdWithCache(id: any): Promise<User | null> {
    if (!id) {
      return null;
    }
    const cacheValue = await getModelItem('user', id.toString());
    if (cacheValue) {
      return new UserModel(cacheValue).toObject();
    }
    const value = await UserModel.findById(id).select('firstname lastname picture')
    if (!value) {
      return value;
    }

    const objectValue = value.toObject();
    saveModelItem('user', objectValue);
    return objectValue;
  }

}

const UserModel = getModelForClass(User, {schemaOptions: {timestamps: true}});

export { UserModel };
