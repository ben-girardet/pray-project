import 'reflect-metadata';
import fs from 'fs';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import http from 'http';
import cookieParser from 'cookie-parser';
import socket from 'socket.io';
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema, NonEmptyArray } from 'type-graphql';
import contextService from 'request-context';
import jwt from 'express-jwt';
import cors, { CorsOptions } from 'cors';
import { apolloPerfPlugin } from './core/perf';
import { filter } from './middleware/filter';
import { errorHandler } from './middleware/error';

import * as sessionAuth from './middleware/session-auth';

import * as LocalStrategy from './strategies/local.strategy';
import * as JwtStrategy from './strategies/jwt.strategy';

import passport from 'passport';

// Controllers
import { AdminController } from './controllers/admin';
import { AuthController } from './controllers/auth';
import { ImageController } from './controllers/image';

const controllers = [AdminController, AuthController, ImageController];

import { registerControllers } from './core/framework';
import { getVersion } from './core/version';

// Resolvers
import { VersionResolver } from './resolvers/version';
import { UserResolver } from './resolvers/user';
import { UserMessagesResolver } from './resolvers/user.messages';
import { TopicResolver } from './resolvers/topic';
import { TopicMessagesResolver } from './resolvers/topic.messages';
import { TopicPrayersResolver } from './resolvers/topic.prayers';
import { TopicUserResolver, MessageUserResolver, PrayerUserResolver, FriendshipUserResolver, ActivityUserResolver } from './resolvers/x.user';
import { MessageResolver } from './resolvers/message';
import { FriendshipResolver } from './resolvers/friendship';
import { ActivityResolver } from './resolvers/activity';
import { ActivityMessageResolver } from './resolvers/activity.messages';
import { ActivityTopicResolver } from './resolvers/activity.topic';
import { RegistrationResolver } from './resolvers/registration';
import { AuthResolver, customAuthChecker } from './resolvers/auth';
import { CustomerRequestResolver } from './resolvers/customer-request';
const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> =
    [VersionResolver, UserResolver, UserMessagesResolver, TopicResolver, TopicMessagesResolver,
        TopicPrayersResolver, TopicUserResolver, PrayerUserResolver,
        ActivityResolver, ActivityMessageResolver, ActivityTopicResolver, ActivityUserResolver,
        MessageResolver, MessageUserResolver, RegistrationResolver, AuthResolver,
        FriendshipResolver, FriendshipUserResolver, CustomerRequestResolver];

// Sentry
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { apolloSentryPlugin } from './core/apollo-sentry';

// Push Service
import { pushService, testPush } from './core/push-service';
pushService.connect();

const lastClientMajor = 1;
const lastClientMinor = 0;
const lastClientPath = 0;
dotenv.config();

console.log('ENV preview');
console.log('MONGO_HOST', process.env.MONGO_HOST);
console.log('MONGO_PORT', process.env.MONGO_PORT);
console.log('MONGO_DB', process.env.MONGO_DB);
console.log('REDIS_HOST', process.env.REDIS_HOST);
console.log('REDIS_PORT', process.env.REDIS_PORT);

console.log('SENTRY_DSN', process.env.SENTRY_DSN);
console.log('SENTRY_ENV', process.env.SENTRY_ENV);
console.log('SENTRY_RELEASE', process.env.SENTRY_RELEASE);

const whitelist = ['http://localhost:9000', 'http://localhost:9001', 'https://sunago.app', 'https://dev.sunago.app', 'https://www.sunago.app'];
const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if (origin === undefined || origin === null || origin === 'null') {
            // TODO: add a header that must be present here
            // to confirm the request is coming from a mobile app
          callback(null, true)
        } else if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
            // TODO: log this in Sentry
          console.log('Origin not allowed by CORS', origin, typeof origin);
          callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
};

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    // TODO: fix this getUesr
    const user: any = 0; // = await userRepository.findOneOrFail(id);

    if (user) {
        done(null, user);
    }
});

// Setup JwtStrategy middleware
JwtStrategy.register(passport);

// Local strategy middleware
LocalStrategy.register(passport);

// Connect to the database and then start Express
// TODO: fix this connection (using mongoose)
mongoose.connect(
    `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.MONGO_DB,
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASSWORD,
    }).then(async () => {
    const app = express();

    Sentry.init({
        environment: process.env.SENTRY_ENV || 'unset',
        dsn: process.env.SENTRY_DSN,
        debug: true,
                    // integrations: [
                    //     // enable HTTP calls tracing
                    //     new Sentry.Integrations.Http({ tracing: true }),
                    //     // enable Express.js middleware tracing
                    //     new Tracing.Integrations.Express({
                    //     // to trace all requests to the default router
                    //     app,
                    //     // alternatively, you can specify the routes you want to trace:
                    //     // router: someRouter,
                    //     }),
                    // ],
                    // // We recommend adjusting this value in production, or using tracesSampler
                    // // for finer control
                    // tracesSampleRate: 1.0,
      });

    const server = http.createServer(app);
    const io = socket(server);
    const PORT = parseInt(process.env.SERVER_PORT as string) ?? 3000;

    app.use(filter());

    // app.use(Sentry.Handlers.requestHandler());
    // app.use(Sentry.Handlers.tracingHandler());

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                blockAllMixedContent: [],
                fontSrc: ["'self'", "https:", "data:"],
                frameAncestors: ["'self'"],
                imgSrc: ["'self'", "data:", "https:", "http:"],
                objectSrc: ["'none'"],
                scriptSrc: ["'self'", "https:", "'unsafe-inline'"],
                scriptSrcAttr: ["'none'"],
                styleSrc: ["'self'", "https:", "'unsafe-inline'"],
                upgradeInsecureRequests: [],
            }
        },
    }));
    app.use(cookieParser());

    app.use(contextService.middleware('request'));

    app.get('/version', (req, res) => {
        res.setHeader('content-type', 'application/json');
        res.send(getVersion());
    });

    app.get('/', (req, res) => {
        res.send('It works!');
    });

    app.use(express.static(path.join(__dirname, './public')));

    // Configure session auth
    sessionAuth.register(app);

    // Initialize passport authentication
    app.use(passport.initialize());
    app.use(passport.session());

    // Configure Express to handle incoming JSON bodies
    app.use(express.json());

    // Register GraphQL Api
    const schema = await buildSchema({
        resolvers: resolvers,
        authChecker: customAuthChecker
    });
    const apolloServer = new ApolloServer(
        {
            schema,
            context: ({ req, res }) => {
                const context = {
                  req,
                  res,
                  user: req.user,
                  locals: {}
                };
                return context;
            },
            plugins: [
                apolloPerfPlugin,
                apolloSentryPlugin
            ]
        });
    app.use('/graphql', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const clientVersion = req.header('sunago-version');
        if (req.method !== 'OPTIONS' && clientVersion) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            const digits = clientVersion.split('.').map(v => parseInt(v, 10));
            if (
                digits[0] > lastClientMajor
                || digits[0] === lastClientMajor && digits[1] > lastClientMinor
                || digits[0] === lastClientMajor && digits[1] === lastClientMinor && digits[2] >= lastClientPath
            ) {
                // all good
            } else {
                return cors(corsOptions)(req, res, () => {
                    return next(new Error('Out of date client'));
                });
            }
        }
        if (!req.header('Authorization')) {
            // if not Authorization header, check in cookie
            const { jwt } = req.cookies;
            if (jwt) {
                req.headers.authorization = `Bearer ${jwt}`;
            }
        }
        next();
        // TODO: Add test for this authoritation via cookie
    });
    app.use('/graphql', jwt({
        secret: process.env.JWT_SECRET_OR_KEY as string,
        credentialsRequired: false,
        algorithms: ['HS256']
    }))
    apolloServer.applyMiddleware({app, path: '/graphql', cors: corsOptions});


    // Register our controllers with Express
    app.use(cors(corsOptions));
    app.use('/push/test', testPush);
    registerControllers(controllers, app);

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
          console.log('user disconnected');
        });
      });

    app.use(Sentry.Handlers.errorHandler());
    app.use(errorHandler);

    // Start the server
    server.listen(PORT, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });
}).catch(error => console.log(error));
