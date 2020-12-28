import express from 'express';
import { User } from '../models/user';
import { Auth, Controller, Delete, Get, Patch, Post, Restrict } from '../core/framework';
import { config } from '../core/config';

@Controller('/api/admin')
export class AdminController {
    // @Auth('jwt')
    // @Restrict('admin')
    // @Get('/users/:id')
    // async getUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    //     const id = parseInt(req.params.id);
    //     const user: any = 0; // = await userRepository.findOneOrFail({id});

    //     return res.status(200).json(user);
    // }

    // @Auth('jwt')
    // @Restrict('admin')
    // @Get('/users/:page?/:perPage?')
    // async getUsers(req: express.Request, res: express.Response, next: express.NextFunction) {
    //     const page = parseInt(req.params.page) ?? 1;
    //     const perPage = parseInt(req.params.perPage) ?? 10;

    //     const [result, total] = [0, 0]; // await userRepository.findAndCount({take: perPage, skip: (page - 1) * perPage});

    //     const totalPages = Math.ceil(total / perPage);

    //     return res.status(200).json({results: result, total, currentPage: page, itemsPerPage: perPage, totalPages});
    // }

    // @Auth('jwt')
    // @Restrict('admin')
    // @Post('/users')
    // async createUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    //     const user = new User();

    //     user.firstname = req.body.firstName ?? '';
    //     user.lastname = req.body.lastName ?? '';
    //     user.email = req.body.email;
    //     user.mobile = req.body.mobile;
    //     user.emailValidated = !!req.body.email_verified ?? false;
    //     user.roles = [];

    //     user.hashPassword(req.body.password);

    //     if (req.body.roles) {
    //         for (const r of req.body.roles) {
    //             if (config.ROLES.includes(r)) {
    //                 user.roles.push(r);
    //             }
    //         }
    //     }

    //     // await userRepository.save(user);

    //     return res.status(200).send('ok');
    // }

    // @Auth('jwt')
    // @Restrict('admin')
    // @Delete('/users/:id')
    // async deleteUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    //     const id = req.params.id as any;
    //     // await userRepository.delete({id});

    //     return res.status(200).send('ok');
    // }

    // @Auth('jwt')
    // @Restrict('admin')
    // @Patch('/users/:userId')
    // async updateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    //     const id = req.params.id as any;
    //     const body: Partial<User> = req.body;
    //     const keys = Object.keys(req.body) as any;

    //     // const user = await userRepository.findOneOrFail(id, { select: keys });
    //     const user: any = 0;

    //     keys.forEach(k => {
    //         if (k in user) {
    //             user[k] = body[k];
    //         } else {
    //             delete user[k];
    //         }
    //     });

    //     // We are changing the password
    //     if ('password' in keys) {
    //         user.hashPassword(user.password);
    //     }

    //     // userRepository.update({id}, user);

    //     return res.status(200).json(user);
    // }

}
