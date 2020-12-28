import express from 'express';
import passport from 'passport';
import { verify } from '../middleware/verify';
import { use } from '../middleware/use';
import { RoleType } from './config';


export interface RouteDefinition {
    path: string;
    method: 'get' | 'post' | 'delete' | 'options' | 'patch' | 'put';
    name: string | symbol;
}

export type RouteMiddlewareTypes = 'facebook' | 'github' | 'google' | 'register' | 'jwt' | null | undefined;

export const registerControllers = (controllers: any[], app: express.Application) => {
    controllers.forEach(controller => {
        const instance = new controller();
        const prefix = Reflect.getMetadata('prefix', controller);
        const routes: RouteDefinition[] = Reflect.getMetadata('routes', controller) || [];

        routes.forEach(route => {
            const restrictToRole = Reflect.getMetadata('role', instance[route.name]);
            const auth = Reflect.getMetadata('auth', instance[route.name]);
            const authConfig = Reflect.getMetadata('authConfig', instance[route.name]) ?? {session: false};

            if (auth) {
                if (restrictToRole) {
                    app[route.method](`${prefix}${route.path}`, passport.authenticate(auth, authConfig), verify(restrictToRole), (req: express.Request, res: express.Response, next: express.NextFunction) => {
                        use(instance[route.name](req, res, next));
                    });
                } else {
                    app[route.method](`${prefix}${route.path}`, passport.authenticate(auth, authConfig), (req: express.Request, res: express.Response, next: express.NextFunction) => {
                        use(instance[route.name](req, res, next));
                    });
                }
            } else {
                app[route.method](`${prefix}${route.path}`, (req: express.Request, res: express.Response, next: express.NextFunction) => {
                    use(instance[route.name](req, res, next));
                });
            }
        });
    });
}

export const Controller = (prefix: string = ''): ClassDecorator => {
    return (target: any) => {
        Reflect.defineMetadata('prefix', prefix, target);
    };
}

export const Restrict = (role: RoleType): MethodDecorator => {
    return (target, propertyKey: string | symbol): void => {
        Reflect.defineMetadata('role', role, target[propertyKey]);
    };
}

export const Auth = (auth: RouteMiddlewareTypes, authConfig: any = null): MethodDecorator => {
    return (target, propertyKey: string | symbol): void => {
        Reflect.defineMetadata('authConfig', authConfig, target[propertyKey]);
        Reflect.defineMetadata('auth', auth, target[propertyKey]);
    };
}

export const Verb = (path: string, verb: RouteDefinition['method']): MethodDecorator => {
    return (target, propertyKey: string | symbol): void => {
        if (!Reflect.hasMetadata('routes', target.constructor)) {
            Reflect.defineMetadata('routes', [], target.constructor);
        }

        const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];

        routes.push({
            method: verb,
            path,
            name: propertyKey
        });

        Reflect.defineMetadata('routes', routes, target.constructor);
    };
};

export const Get = (path: string): MethodDecorator => {
    return Verb(path, 'get');
};

export const Post = (path: string): MethodDecorator => {
    return Verb(path, 'post');
};

export const Delete = (path: string): MethodDecorator => {
    return Verb(path, 'delete');
};

export const Options = (path: string): MethodDecorator => {
    return Verb(path, 'options');
};

export const Patch = (path: string): MethodDecorator => {
    return Verb(path, 'patch');
};

export const Put = (path: string): MethodDecorator => {
    return Verb(path, 'put');
};
