import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { User } from '../models/user';

export const register = (passport) => {
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET_OR_KEY
    }, async (jwtPayload, done) => {
        const id = jwtPayload.sub;
        
        // TODO: fix this findOne
        const user: any = 0; // await userRepository.findOne(id);

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }));
};