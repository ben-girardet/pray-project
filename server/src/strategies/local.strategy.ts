import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { User } from '../models/user';
import { validate } from 'class-validator';
import { response } from 'express';
import { config } from '../core/config';

export const register = (passport: passport.PassportStatic) => {
    passport.use(
        'register',
        new LocalStrategy(
            { passReqToCallback: true },
            async (req, username, password, done) => {
                const user = new User();
                user.email = req.body.email;
                user.mobile = req.body.mobile;
                user.firstname = req.body.firstName;
                user.lastname = req.body.lastName;
                user.hashPassword(req.body.password);

                // Users are default user role
                // TODO: fix this getRole
                const role: any = 0; // = await roleRepository.findOne({where: { name: config.DEFAULT_ROLE }});

                if (role) {
                    user.roles = [role];
                }

                const errors = await validate(user);
                if (errors.length) {
                    response.status(400).send(errors);
                    return;
                }


                try {

                    // TODO: Fix this save user
                    const save: any = Promise.resolve(); // = await userRepository.save(user);
                    // TODO: Fix this get User
                    const userQueried: any = 0; // = await userRepository.findOneOrFail({id: save.id});

                    return done(null, userQueried);
                } catch (error) {
                    done(error);
                }
            }
        )
    );

    passport.use(
        'login',
        new LocalStrategy({}, async (username, password, done) => {
            try {
                // TODO: Fix this data thing
                /* const user = await getRepository(User)
                    .createQueryBuilder('user')
                    .addSelect('user.password')
                    .where('user.username = :username', { username })
                    .getOne(); */
                const user: any = 0;

                if (!user) {
                    return done(null, false, {
                        message: 'Incorrect username or password',
                    });
                }

                if (!user.passwordValid(password)) {
                    return done(null, false, {
                        message: 'Incorrect username or password',
                    });
                }

                return done(null, user);
            } catch (error) {
                return done (error, null);
            }
        })
    );
};
