import 'reflect-metadata';
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

// Resolvers
import { UserResolver } from './resolvers/user';
import { UserMessagesResolver } from './resolvers/user.messages';
import { TopicResolver } from './resolvers/topic';
import { TopicMessagesResolver } from './resolvers/topic.messages';
import { MessageResolver } from './resolvers/message';
import { RegistrationResolver } from './resolvers/registration';
import { AuthResolver, customAuthChecker } from './resolvers/auth';
const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> =
    [UserResolver, UserMessagesResolver, TopicResolver, TopicMessagesResolver, MessageResolver, RegistrationResolver, AuthResolver];


dotenv.config();

const corsOptions: CorsOptions = {
    origin: 'http://localhost:9000',
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
    'mongodb://localhost:27017/',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.DBNAME
    }).then(async () => {
    const app = express();
    const server = http.createServer(app);
    const io = socket(server);
    const PORT = parseInt(process.env.SERVER_PORT as string) ?? 3000;

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
                };
                return context;
            },
        });
    app.use('/graphql', (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    registerControllers(controllers, app);

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
          console.log('user disconnected');
        });
      });

    // Start the server
    server.listen(PORT, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });
}).catch(error => console.log(error));
