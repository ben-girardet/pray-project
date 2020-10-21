import axios from 'axios';
import express from 'express';
import { User } from '../../models/user';
import { config, RoleType } from '../config';

export const FacebookProvider = async (req: express.Request) => {
    const tokenUrl = `https://graph.facebook.com/v8.0/oauth/access_token`;
    const profileUrl = `https://graph.facebook.com/v8.0/me`;

    const body = {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: process.env.FACEBOOK_CALLBACK_URL,
        code: req.query.code
    };

    const tokens = await axios.get(tokenUrl, {
        params: body,
        headers: {
            accept: 'application/json'
        }
    });

    const user = await axios.get(profileUrl, {
        params: {
            fields: 'id,name,email,picture.type(large)'
        },
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${tokens.data.access_token}`
        }
    });

    let roles: RoleType[] = [config.DEFAULT_ROLE as RoleType];

    // TODO: Fix these get things
    // const fetchedUser = await userRepository.findOne({ where: { facebookId: user.data.id }});
    const fetchedUser: any = 0;

    if (fetchedUser) {
        roles = fetchedUser.roles.reduce((arr, role) => {
            arr.push(role.name as RoleType);
            return arr;
        }, [] as RoleType[]);

        fetchedUser.facebookId = user.data.id;
        fetchedUser.username = fetchedUser.username ?? `facebook-user${user.data.id}`;
        fetchedUser.email = fetchedUser.email ?? user.data.email;
        fetchedUser.email_verified = true;
        fetchedUser.firstName = fetchedUser.firstName ?? user.data.name.split(' ')[0];
        fetchedUser.lastName = fetchedUser.lastName ?? user.data.name.split(' ')[1];
        fetchedUser.password = fetchedUser.password ?? '';

        // TODO: fix this save
        // await userRepository.save(fetchedUser);
    } else {
        const userModel = new User();
        // TODO: fix this get
        // const role = await roleRepository.findOne({where: { name: config.DEFAULT_ROLE }});
        const role: any = 0;

        userModel.facebookId = user.data.id;
        userModel.email = user.data.email;
        userModel.emailValidated = true;
        userModel.firstname = user.data.name.split(' ')[0];
        userModel.lastname = user.data.name.split(' ')[1];
        userModel.hash = '';
        userModel.salt = '';

        if (role) {
            userModel.roles = [role];
        }

        // TODO: Fix this insert
        // await userRepository.insert(userModel);
    }

    return {
        accessToken: tokens.data.access_token,
        user: user.data,
        roles
    };
};
